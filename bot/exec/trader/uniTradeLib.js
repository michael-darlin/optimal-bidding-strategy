'use strict'
// Silence all output (except for process.stdout). 
// MUST keep on for production (multiple parts of auction-keeper rely on this file, and need silent output)
// Disable for testing
// console.log = function() {}

/* !----1. Set libraries ----! */
// Start libraries
const uni = require('@uniswap/sdk')
const es = require('ethers')
const fs = require('fs')
const axios = require('axios')
const uniHelper = require('./uniHelperLib')
const uniAbi = require('./../../abi/uniAbi.js')
const tokenAbi = require('./../../abi/tokenAbi.js')
const addrFile = require('./../../addr/ethAddr.js')
const secrets = require('./../../../secrets.js')
const yargs = require('yargs').default({
	in: 'dai',
	out: 'weth',
	amount: '1',
	chain: 'kovan',
	type: 'exactIn', // type can be either "exactIn" or "exactOut"
})
const args = yargs.argv

/**
 * Trade tokens on Uniswap
 * @param  {String} [inputTokenName=args.in] - Name of the token that will be traded into Uniswap
 * @param  {String} [outputTokenName=args.out] - Name of the token that will be received back from Uniswap
 * @param  {String} [amount=args.amount] - Amount to be traded in (if type = "exactIn") or amount to be received back (if type = "exactOut"), in ethers
 * @param  {String} [chain=args.chain] - Name of chain to connect to (main or kovan)
 * @param  {String} [tradeType=args.type] - exact amount in ("exactIn") or exact amount out ("exactOut")
 * @output Informating regarding executed trade
 * @return {void}
 */
async function tradeTokens(inputTokenName = args.in, outputTokenName = args.out, amount = args.amount, chain = args.chain, tradeType = args.type) {
	// 0. Define variables
	let inputTokenUpper = inputTokenName.toUpperCase()
	let outputTokenUpper = outputTokenName.toUpperCase()

	// 1. Connect to wallets/contracts, define address
	if (chain === 'main') {
		// 1a. Connect to provider
		var provider = new es.providers.InfuraProvider('homestead', secrets.infuraKey)

		// 1b. Connect to wallet
		var wallet = new es.Wallet(secrets.mmAcctPrivateKey, provider)

		// 1c. Define addresses to use
		var addr = addrFile.main
		var address = addr.mm

		// 1d. Connect to contracts
		var router = new es.Contract(addr.router02, uniAbi.router02, wallet)
		var inputToken = new es.Contract(addr[inputTokenName], tokenAbi[inputTokenName], wallet)

		// 1e. Rename chainName, and convert to uppercase
		// In our parameters, we call the main network "main", but Uniswap SDK calls it "MAINNET". Therefore, convert "main" to the full name
		var chainName = 'MAINNET' 
	} else if (chain === 'kovan') {
		// 1a. Connect to provider
		var provider = new es.providers.JsonRpcProvider(); //default to localhost:8545

		// 1b. Connect to wallet
		// Create wallet from keystore/password
		const temp = await es.Wallet.fromEncryptedJson(secrets.parityAcctKeystore, secrets.parityAcctPassword)
		// Create wallet, with provider as signer
		var wallet = new es.Wallet(temp.privateKey, provider)

		// 1c. Define address to use
		var addr = addrFile.kovan
		var address = addr.parity

		// 1d. Connect to contracts
		var router = new es.Contract(addr.router02, uniAbi.router02, wallet)
		var inputToken = new es.Contract(addr[inputTokenName], tokenAbi[inputTokenName], wallet)

		// 1e. Convert chainName to uppercase
		var chainName = chain.toUpperCase()
	}
	console.log('Step 1 of 4: Connected to contracts')

	// 2. Perform checks
	let amountRaw = ''; let amountStr = ''; let amountWei = '';

	// Set the amount to be converted
	let curBal = await inputToken.balanceOf(address)
	if (amount === 'all') {
		amountWei = curBal
		amountStr = es.utils.formatUnits(amountWei)
		amountRaw = parseFloat(amountStr, 10)
	} else {
		amountRaw = amount
		amountStr = amount.toString()
		amountWei = es.utils.parseUnits(amountStr)
	}

	// Check A: If the current balance of the input currency in the account is 0, then no trade can be made
	if (curBal.eq(0)) {
		console.log(`The balance of ${inputTokenUpper} in this account is 0. No transfer has been made.`)
		return
	}

	// These checks only need to be performed if tradeType is "exactIn." If the tradeType is "exact out", the checks will be performed when the transaction is
	// submitted to uniHelper
	if (tradeType === 'exactIn') {
		// Check B: If the amount to be converted is greater than the current balance, the amount cannot be converted.
		if (amountWei.gt(curBal)) {
			let amtEth = es.utils.commify(es.utils.formatUnits(amountWei, 'ether'))
			let curBalEth = es.utils.commify(es.utils.formatUnits(curBal, 'ether'))
			console.log(`ERROR: The amount of ${inputTokenUpper} to be converted (${amtEth}) is great than the amount of ${inputTokenUpper} in this account (${curBalEth}). No trade has been made.`)
			return
		}

		// Check C: Check if allowance is sufficient for this amount. Increase allowance amount, if needed, so that trade can go through
		const allowance = await inputToken.allowance(address, addr.router02)
		if (allowance.lt(amountWei)) {
			const tx = await inputToken.approve(addr.router02, amountWei)
			const receipt = await tx.wait()
			let allowanceEth = es.utils.formatUnits(allowance, 'ether')
			console.log(`Allowance has been increased from ${allowanceEth} to ${amountRaw} ${inputTokenUpper}`)
			console.log(`Transaction hash: ${tx.hash}`)
		}
	}
	// Technically not true for "exactOut" trades, but still provides a status update
	console.log('Step 2 of 4: Verified allowance amount')

	// 3. Get the implicit price from the reserves
	const implicitPriceResults = await getImplicitPrice(inputTokenName, outputTokenName, chainName, addr)
	console.log('Step 3 of 4: Calculated implicit price')

	// 4. Execute trade
	if (args.chain === 'main') {
		// DO NOT submit any transactions on mainnet, until absolutely ready
		return
	} else if (args.chain === 'kovan') {
		if (tradeType === 'exactIn') {
			var receipt = await uniHelper.swapTokens({
				ethersSigner: wallet,
				recipient: address,
				inputAmount: amountStr,
				inputToken: addr[inputTokenName],
				outputToken: addr[outputTokenName],
				maxSlippage: 100,
				maxDelay: 60 * 2
			})
		} else if (tradeType === 'exactOut') {
			var receipt = await uniHelper.swapTokens({
				ethersSigner: wallet,
				recipient: address,
				outputAmount: amountStr,
				inputToken: addr[inputTokenName],
				outputToken: addr[outputTokenName],
				maxSlippage: 100,
				maxDelay: 60 * 2
			})
		}
	}
	console.log('Step 4 of 4: Executed trade')
	console.log('Transaction hash:', receipt.transactionHash)

	// 5. Log results
	// A. tradePrice
	let tradePriceRaw = parseInt(receipt.logs[1].data, 16)
	let tradePriceStr = tradePriceRaw.toString()
	let tradePriceWei = es.utils.parseUnits(tradePriceStr, 'wei')
	let tradePriceWeiEth = es.utils.formatUnits(tradePriceWei)
	// Divide by input amount, to convert to a per-unit basis
	let tradePriceWeiPer = tradePriceWei.mul(es.constants.WeiPerEther).div(amountWei)
	let tradePriceWeiPerEth = es.utils.formatUnits(tradePriceWeiPer)

	// B. implicitPrice
	let implicitPriceRaw = implicitPriceResults.rate
	let implicitPriceStr = implicitPriceResults.rate.toString()
	let implicitPriceWei = es.utils.parseUnits(implicitPriceStr, 'ether')

	// C. slippage
	let difference = implicitPriceWei.sub(tradePriceWeiPer)
	let slippage = (difference.mul(es.constants.WeiPerEther)).div(implicitPriceWei)
	let slippageEth = es.utils.formatUnits(slippage)

	console.log('\nFinal results')
	console.log(`${amountRaw} ${inputTokenUpper} was traded for ${tradePriceWeiEth} ${outputTokenUpper}`)
	console.log(`The implicit price for ${inputTokenUpper} was ${implicitPriceRaw} per unit`)
	console.log(`The price obtained from this trade was ${tradePriceWeiPerEth} per unit`)
	console.log(`The slippage amount was ${slippageEth}`)

	console.log('amount:', amount)
	console.log('amountRaw:', amountRaw)
	console.log('amountStr:', amountStr)
	console.log('amountWei:', amountWei)
	console.log('tradePriceRaw:', tradePriceRaw)
	console.log('tradePriceStr:', tradePriceStr)
	console.log('tradePriceWei:', tradePriceWei)
	console.log('tradePriceWeiPer:', tradePriceWeiPer)
	console.log('implicitPriceRaw:', implicitPriceRaw)
	console.log('implicitPriceWei:', implicitPriceWei)
	console.log('implicitPriceStr:', implicitPriceStr)
	console.log('Difference:', difference)
	console.log('Slippage:', slippage)
}

/**
 * Get ratio between two tokens, on Uniswap
 * @param  {String} inputTokenName - Name of the first token in the liquidity pool
 * @param  {String} outputTokenName - Name of the second token in the liquidity pool
 * @param  {String} chaiName - Name of chain to connect to (main or kovan)
 * @param  {Object} addr - Object containing a list of addresses for the selected network (main or kovan)
 * @return {Object} object.rate is an ethers.FixedNumber, and object.type is "Uniswap"
 */
async function getImplicitPrice(inputTokenName, outputTokenName, chainName, addr) {
	// 1a. Convert to lower case, because searching in "addr" is case-sensitive
	let inputTokenNameLower = inputTokenName.toLowerCase()
	let outputTokenNameLower = outputTokenName.toLowerCase()

	// 1b. Create pair
	// Don't know number of decimals (most have 18, USDC has 6, WBTC has 8), so need to use fetchData
	try { var inputToken = await uni.Token.fetchData(uni.ChainId[chainName], addr[inputTokenNameLower]) }
	catch (e) { console.log(`No token address exists for ${inputTokenNameLower}`); return }
	try { var outputToken = await uni.Token.fetchData(uni.ChainId[chainName], addr[outputTokenNameLower]) }
	catch (e) { console.log(`No token address exists for ${outputTokenNameLower}`); return }

	let pair = await assignPairIfExists(uni, inputToken, outputToken)

	// If pair doesn't exist, then use Nomics to get market rate
	if (pair === false) {
		// 2. Get market exchange rate from Nomics
		let currentPrices = await getCurrentPrices(inputTokenName, outputTokenName)
		
		// 3. Calculate exchange rate between two currencies
		// Need to convert to Fixed Number before dividing, so that number doesn't under/overflow
		let inputTokenPrice = es.FixedNumber.from(currentPrices.inputTokenPrice)
		let outputTokenPrice = es.FixedNumber.from(currentPrices.outputTokenPrice)

		// 4. Define answers
		// Output answer as a Fixed Number, to match the output coming from divUni
		var results = {
			rate: inputTokenPrice.divUnsafe(outputTokenPrice),
			type: 'Nomics',
		}
	} 
	// If pair does exist, use Uniswap to get market rate
	else {
		// 2. Determine order of the reserves (which are arbitrarily set by contract), so that the reserve order matches the token order (to enable correct 
		// division)
		let reserve0, reserve1
		if (pair.token0.address === addr[inputTokenNameLower]) {
			reserve0 = pair.reserve1
			reserve1 = pair.reserve0
		} else {
			reserve0 = pair.reserve0
			reserve1 = pair.reserve1
		}

		// 3. calculate implicit price
		let numerator = divUni(reserve0)
		let denominator = divUni(reserve1)

		// 4. Define results
		// rate is a Fixed Number
		var results = {
			rate: numerator.divUnsafe(denominator),
			type: 'Uniswap',
		}
	}

	return results
}

/**
 * Convert a numerator/denominator from a JSBI object into FixedNumber (ethers.js), and then divide
 * @param  {JSBI} jsbiObj - JSBI object
 * @param  {Number} numerDecimal - number of decimals in the JSBI numerator
 * @param  {Number} denomDecimal - number of decimals in the JSBI denominator
 * @return {ethers.FixedNumber} Result of dividing numerator into denominator
 */
function divUni(jsbiObj, numerDecimal, denomDecimal) {
	// Check A: if the object type is not JSBI, then end function
	let constructorName = jsbiObj.numerator.constructor.name
	if (constructorName !== 'JSBI') {
		console.log('The value passed in is not the correct object type (JSBI)')
		return false
	}

	// 1. Assign numerator/denominator from the JSBI object
	// 1a. Convert JSBI object (numerator and denominator) to a string
	var numerStr = jsbiObj.numerator.toString()
	var denomStr = jsbiObj.denominator.toString()

	// 1b. If the number of decimals is different, then add extra zeroes to the smaller value. That way, the two numbers can be divided into one another
	// The number of zeroes to add is the difference in decimals between the numerator and denominator. For example, if the numerator is 18 decimals and the
	// denominator is 6, then 12 zeroes should be added to denominator
	if (numerDecimal > denomDecimal) {
		let difference = numerDecimal - denomDecimal // Determine differences in decimals
		let newLength = denomStr.length + difference // Compute new length, based on existing length + difference in decimals
		denomStr = denomStr.padEnd(newLength, '0')
	} else if (numerDecimal < denomDecimal) {
		let difference = denomDecimal - numerDecimal // Determine differences in decimals
		let newLength = numerStr.length + difference // Compute new length, based on existing length + difference in decimals
		numerStr = numerStr.padEnd(newLength, '0')
	}

	// 1c. Convert the string to FixedNumber object in the ethers.js library
	var numerator = es.FixedNumber.from(numerStr)
	var denominator = es.FixedNumber.from(denomStr)

	// 2. Divide, to get the final answer
	let answer = numerator.divUnsafe(denominator)

	// 3. Return the answer (FixedNumber object in ethers.js)
	return answer
}

// OUTDATED: need to add currentRate, to call getOutputPrices correctly
/**
 * Find out value of trade for given input/output tokens, and amount
* @param  {String} inputTokenName - Name of the token that will be traded into Uniswap
 * @param  {String} outputTokenName - Name of the token that will be received back from Uniswap
 * @param  {String} amount - Amount to be traded in (only handles "exactIn" trades)
 * @output String containing results of trade
 * @return {void}
 */
async function getTradeData(inputTokenName, outputTokenName, amount) {
	// Step 1. Create tokens and pair
	// 1a. Create tokens
	let inputTokenNameUpper = inputTokenName.toUpperCase()
	let outputTokenNameUpper = outputTokenName.toUpperCase()

	// Don't know number of decimals (most have 18, USDC has 6), so need to use fetchData
	// Some addresses may not exist, so need to execute in a try statement
 	try { var inputToken = await uni.Token.fetchData(uni.ChainId[chainName], addr[inputTokenName]) }
	catch (e) { console.log(`No token address exists for ${inputTokenNameUpper}`); return }

	try { var outputToken = await uni.Token.fetchData(uni.ChainId[chainName], addr[outputTokenName]) }
	catch (e) { console.log(`No token address exists for ${outputTokenNameUpper}`); return }

	// 1b. Create pair
	// If the pair is not created yet, this code will throw an error. There is no way to check for the error beforehand in the Uniswap SDK, because
	// getAddress will return address, even if the contract has not yet been deployed. If error is thrown, the function will stop
	try { var pair = await uni.Pair.fetchData(inputToken, outputToken) }
	catch (e) { console.log(`No pair exists for ${inputTokenNameUpper} and ${outputTokenNameUpper}`); return }

	// Step 2: Create trade
	const route = new uni.Route([pair], inputToken)

	let amountRaw = amount
	let amountStr = amountRaw.toString()
	let amountBigNum = es.utils.parseUnits(amountStr, inputToken.decimals)

	const trade = new uni.Trade(route, new uni.TokenAmount(inputToken, amountBigNum), uni.TradeType.EXACT_INPUT)

	// Step 3: Output information
	// 3a. Output token information
	console.log(`\nInput token: ${inputTokenNameUpper} \nOutput token: ${outputTokenNameUpper}`)

	// 3b. Output price information
	outputTradePrices(trade, inputToken.decimals, outputToken.decimals)
}

/**
 * Output information about a Uniswap trade
 * @param  {uniswap.Trade} trade - Results of a pre-determined trade on Uniswap
 * @param  {ethers.FixedNumber} currentRate - The current market rate (used to calculate slippage)
 * @param  {Number} inputDecimal - number of decimals used in inputAmount
 * @param  {Number} outputDecimal - number of decimals used in outputAmount
 * @return {ethers.FixedNumber} Slippage percentage for the specified trade
 */
function outputTradePrices(trade, currentRate, inputDecimal, outputDecimal) {
	// 0. Define object we'll be iterating through
	let o = {
		'Input amount': {
			value: trade.inputAmount,
			numerDecimal: inputDecimal,
			denomDecimal: inputDecimal,
		},
		'Output amount': {
			value: trade.outputAmount,
			numerDecimal: outputDecimal,
			denomDecimal: outputDecimal,
		},
		'Trade exchange rate': {
			value: trade.executionPrice,
			numerDecimal: outputDecimal,
			denomDecimal: inputDecimal,
		},
	}

	// 1. Log values from trade (provided by Uniswap)
	for (let key in o) {
		if (o.hasOwnProperty(key)) {
			let final = divUni(o[key].value, o[key].numerDecimal, o[key].denomDecimal)
			console.log(key + ': ' + final)
		}
	}

	// 2. Calculate and log slippage
	// We don't use slippage from Uniswap, because it's not accurate when there are more than two swaps in a trade
	let key = 'Trade exchange rate'
	let executionRateFormat = divUni(o[key].value, o[key].numerDecimal ,o[key].denomDecimal)
	let currentRateFormat = es.FixedNumber.fromValue(currentRate, 18)

	let difference = currentRateFormat.subUnsafe(executionRateFormat)
	let slippage = difference.divUnsafe(currentRateFormat)
	let slippageStr = slippage.toString()
	console.log('Slippage: ' + slippageStr)

	return slippage
}

/**
 * Find the best trade for the specified pair
 * @param  {String} [inputTokenName=args.in] - Name of the token that will be traded into Uniswap
 * @param  {String} [outputTokenName=args.out] - Name of the token that will be received back from Uniswap
 * @param  {String} [inputAmount=args.amount] - Amount to be traded in (if type = "exactIn") or amount to be received back (if type = "exactOut"), in ethers
 * @param  {String} [chain=args.chain] - Name of chain to connect to (main or kovan)
 * @output Informating regarding selected trade
 * @return {Object} object.bidPrice is the maximum bidding price for the specified auction; object.gasPrice is the appropriate gas price
 */
async function getBestTrade(inputTokenName = args.in, outputTokenName = args.out, inputAmount = args.amount, chain = args.chain) {
	// 1a. Convert chainName to uppercase and/or or new word
	if (chain === 'main') {
		var chainName = 'MAINNET' // In our parameters, we call the main network "main", but Uniswap SDK calls it "MAINNET". Therefore, convert "main" to the full name
		var addr = addrFile.main
	} else {
		var chainName = chain.toUpperCase()
		var addr = addrFile.kovan
	}

	// 1b. Define initial variables
	let tokenAddresses = [addr.weth, addr.usdc, addr.dai, addr.tusd, addr.bat, addr.wbtc]
	let pairArr = []

	// 2. Create TokenAmount
	let inputTokenNameUpper = inputTokenName.toUpperCase()
	let outputTokenNameUpper = outputTokenName.toUpperCase()

	// Don't know number of decimals (most have 18, USDC has 6, WBTC has 8), so need to use fetchData
	// Some addresses may not exist, so need to execute in a try statement
 	try { var inputToken = await uni.Token.fetchData(uni.ChainId[chainName], addr[inputTokenName]) }
	catch (e) { console.log(`No token exists for ${inputTokenNameUpper}`); return }

	try { var outputToken = await uni.Token.fetchData(uni.ChainId[chainName], addr[outputTokenName]) }
	catch (e) { console.log(`No token exists for ${outputTokenNameUpper}`); return }

	let amountRaw = inputAmount
	let amountStr = amountRaw.toString()
	let amountFixed = es.FixedNumber.fromString(amountStr, 'fixed128x80')
	// Need to round because input from auction-keeper goes to 45 decimals; Uniswap only supports 18 decimals
	let amountFixedRounded = amountFixed.round(inputToken.decimals)
	let amountFixedRoundedStr = amountFixedRounded.toString()
	let amountBigNum = es.utils.parseUnits(amountFixedRoundedStr, inputToken.decimals)
	let tokenAmount = new uni.TokenAmount(inputToken, amountBigNum)

	// 3. Loop through each tokenAddress
	for (let i = 0; i < tokenAddresses.length; i++) {
		// If on the last item, then all addresses have been paired. Therefore, don't go through this loop
		if (i === (tokenAddresses.length - 1)) {
			continue
		}

		console.log(`Iteration ${i}`)

		// Ensure that each token is paired up with all other tokens.
		// Do this by starting a loop on the index after i (j = i + 1), and going through all items until the end of the array
		for (let j = (i + 1); j < tokenAddresses.length; j++) {
			console.log(`Iteration ${i}, pairing ${j} of ${tokenAddresses.length - 1}`)
			// A. Create two Tokens
			// Ensure that addresses for all tokens exist
		 	try { var token0 = await uni.Token.fetchData(uni.ChainId[chainName], tokenAddresses[i]) }
			catch (e) { console.log(`No token exists at address ${tokenAddresses[i]}`); continue }

			try { var token1 = await uni.Token.fetchData(uni.ChainId[chainName], tokenAddresses[j]) }
			catch (e) { console.log(`No token exists for ${tokenAddresses[j]}`); continue }

			// B. Check if pair exists. 
			// If loop doesn't exist, the loop will continue to next iteration
			let pair = await assignPairIfExists(uni, token0, token1)
			if (pair === false) {
				console.log(`No pair currently exists for ${token0.address} and ${token1.address}`)
				continue
			}

			// C. Push pair into pairArr
			pairArr.push(pair)
		}
	}

	// 4. Get current prices
	let currentRate = await getImplicitPrice(inputTokenName, outputTokenName, chainName, addr)
	// If the output amount isn't WETH, we need to get the current exchange rate between ETH and the output amount. That way, we can convert the
	// gas fee (which is in WETH) to a percentage of the output amount
	if (outputTokenName !== 'weth') {
		// If the inputToken is WETH, we already have the rate calculated. If the inputToken isn't WETH, we need to make a new call to get the rate
		if (inputTokenName === 'weth') {
			var currentEthRate = currentRate
		} else {
			var currentEthRate = await getImplicitPrice('weth', outputTokenName, chainName)
		}
	}

	// If the output amont isn't DAI, then we need to get the current exchange rate between DAI and the output amount. THat way, we can convert the rebalance
	// constant (which is in DAI) to a percentage of the output amount
	if (outputTokenName !== 'dai') {
		// If the inputToken is DAI, we already have the rate calculated. If the inputToken isn't DAI, we need to make a new call to get the rate
		if (inputTokenName === 'dai') {
			var currentDaiRate = currentRate
		} else {
			var currentDaiRate = await getImplicitPrice('dai', outputTokenName, chainName)
		}
	}

	// 5a. Construct best trade
	const bestTrade = uni.Trade.bestTradeExactIn(pairArr, tokenAmount, outputToken, {
		maxHops: 5,
		maxNumResults: 1,
	})

	// 5b. Check: if bestTrade is empty, then no trade route was found, and the function should be ended
	if (bestTrade.length === 0) {
		console.log('No trade route was found for this pair on Uniswap.')
		return
	}

	// 6. Log trade results
	for (let trade of bestTrade) {
		// A. General info, doesn't need conversion
		console.log('\nInformation on trade')
		console.log('Trade route:', trade.route.path)
		console.log(`Market exchange rate (${currentRate.type}): -> ` + currentRate.rate)

		// B. Amounts needing specific conversion
		// outputTradePrices will both output amounts, and return slippage (to be used later)
		let slippage = outputTradePrices(trade, currentRate.rate, inputToken.decimals, outputToken.decimals)

		// C. Gas costs
		// C1. Gas price
		let gasPriceEstimate = await estimateGasPrice('fast')
		var gasPriceWei = es.utils.parseUnits(gasPriceEstimate, 'gwei')

		// C2. Gas estimates
		let tradeGasUsed = estimateGasUsed('trade', {
			tokensInvolved: trade.route.path.length
		})
		let dentGasUsed = estimateGasUsed('dent')
		let dealGasUsed = estimateGasUsed('deal')
		let joinGasUsed = estimateGasUsed('join')
		let exitGasUsed = estimateGasUsed('join')
		let tradeGasFeeWei = gasPriceWei.mul(tradeGasUsed)
		let dentGasFeeWei = gasPriceWei.mul(dentGasUsed)
		let dealGasFeeWei = gasPriceWei.mul(dealGasUsed)		
		let joinGasFeeWei = gasPriceWei.mul(joinGasUsed)
		let exitGasFeeWei = gasPriceWei.mul(exitGasUsed)

		// C3. Gas information
		console.log(`Gas estimate (fast): ${gasPriceEstimate}`)

		// D. Total transaction fees
		// D1. The output amount, from the Uniswap Trade object, uses the outputToken decimals, for both numerator and denominator
		let outputAmount = divUni(trade.outputAmount, outputToken.decimals, outputToken.decimals)

		// D2a. If the output amount is WETH, then the gas fees can be presented in ETH
		if (outputTokenName === 'weth') {
			var tradeGasFeeFixed = es.FixedNumber.fromString(es.utils.formatUnits(tradeGasFeeWei, 'ether'))
			var dentGasFeeFixed = es.FixedNumber.fromString(es.utils.formatUnits(dentGasFeeWei, 'ether'))
			var dealGasFeeFixed = es.FixedNumber.fromString(es.utils.formatUnits(dealGasFeeWei, 'ether'))
			var joinGasFeeFixed = es.FixedNumber.fromString(es.utils.formatUnits(joinGasFeeWei, 'ether'))
			var exitGasFeeFixed = es.FixedNumber.fromString(es.utils.formatUnits(exitGasFeeWei, 'ether'))
		// D2b. If the output amount isn't WETH, then the gas fees (in ETH) need to be converted to the output amount, before dividing
		} else {
			let intermediate = es.FixedNumber.fromString(es.utils.formatUnits(tradeGasFeeWei, 'ether'))
			var tradeGasFeeFixed = intermediate.mulUnsafe(currentEthRate.rate)
			intermediate = es.FixedNumber.fromString(es.utils.formatUnits(dentGasFeeWei, 'ether'))
			var dentGasFeeFixed = intermediate.mulUnsafe(currentEthRate.rate)
			intermediate = es.FixedNumber.fromString(es.utils.formatUnits(dealGasFeeWei, 'ether'))
			var dealGasFeeFixed = intermediate.mulUnsafe(currentEthRate.rate)
			intermediate = es.FixedNumber.fromString(es.utils.formatUnits(joinGasFeeWei, 'ether'))
			var joinGasFeeFixed = intermediate.mulUnsafe(currentEthRate.rate)
			intermediate = es.FixedNumber.fromString(es.utils.formatUnits(exitGasFeeWei, 'ether'))
			var exitGasFeeFixed = intermediate.mulUnsafe(currentEthRate.rate)
		}

		// D3. Adjust the gas fee percentages for transactions that only need to be done periodically (join, exit, trade)
		// The Rebalance constant is the "Economic Order Quantity" - the best quantity at which to rebalance the portfolio back to DAI. It is expressed
		// in terms of DAI, then converted to the output amount
		let rebalanceConst = es.FixedNumber.fromString('2500')
		// rebalancePct is the percentage towards which the trade will move towards the rebalanceConst. This percentage is, effectively, an allocation
		// percentage. It is used to allocate less frequent costs to individual bids
		if (outputTokenName === 'dai') {
			var rebalancePct = outputAmount.divUnsafe(rebalanceConst)
		} else {
			let rebalanceConstConverted = rebalanceConst.mulUnsafe(currentDaiRate.rate)
			var rebalancePct = outputAmount.divUnsafe(rebalanceConstConverted)
		}
		console.log(`rebalancePct: ${rebalancePct}`)

		// D4. Calculate fees as a percentage of the outputAmount
		// If frequency is "bid" (occurs every bid), then the fee is kept as is (dent, deal, exit)
		// If frequency is "batch" (occurs only when a threshold is triggered), then the fee is adjusted by the rebalancePct (trade, join)
		let tradeGasFeePct = tradeGasFeeFixed.divUnsafe(outputAmount).mulUnsafe(rebalancePct)
		let dentGasFeePct = dentGasFeeFixed.divUnsafe(outputAmount)
		let dealGasFeePct = dealGasFeeFixed.divUnsafe(outputAmount)
		let joinGasFeePct = joinGasFeeFixed.divUnsafe(outputAmount).mulUnsafe(rebalancePct)
		let exitGasFeePct = exitGasFeeFixed.divUnsafe(outputAmount).mulUnsafe(rebalancePct)
		let slippagePct = slippage.mulUnsafe(rebalancePct)

		// D5. Calculate other percentages
		let targetProfitPct = es.FixedNumber.fromString('0.0050')
		let trxFeePct = slippagePct.addUnsafe(tradeGasFeePct).addUnsafe(dentGasFeePct).addUnsafe(dealGasFeePct).addUnsafe(joinGasFeePct).addUnsafe(exitGasFeePct)
		var thresholdPct = trxFeePct.addUnsafe(targetProfitPct)

		// D5. Convert all amounts to be displayed as percentages - first, multiplying by 100, then round to 2 decimals
		var hundredFixed = es.FixedNumber.fromString('100')
		let tradeGasFeeDisplayPct = tradeGasFeePct.mulUnsafe(hundredFixed).round(2)
		let dentGasFeeDisplayPct = dentGasFeePct.mulUnsafe(hundredFixed).round(2)
		let dealGasFeeDisplayPct = dealGasFeePct.mulUnsafe(hundredFixed).round(2)
		let joinGasFeeDisplayPct = joinGasFeePct.mulUnsafe(hundredFixed).round(2)
		let exitGasFeeDisplayPct = exitGasFeePct.mulUnsafe(hundredFixed).round(2)
		let slippageDisplayPct = slippagePct.mulUnsafe(hundredFixed).round(2)
		let targetProfitDisplayPct = targetProfitPct.mulUnsafe(hundredFixed).round(2)

		// D6. Calculate final percentage (already converted)
		let trxFeeDisplayPct = trxFeePct.mulUnsafe(hundredFixed).round(2)
		let thresholdDisplayPct = thresholdPct.mulUnsafe(hundredFixed).round(2)

		// D7. Output final amounts
		console.log('\nBidding costs (all amounts are % of output)')
		console.log('1. Deposit USD to Coinbase')
		console.log('	No fees incurred')
		console.log('2. Buy DAI with USD')
		console.log('	Fees incurred only once - not included in this calculation')
		console.log('3. Send DAI to Ethereum account')
		console.log('	Fees incurred only once - not included in this calculation')
		console.log('4. Join DAI to Vat')
		console.log(`	Gas fee: ${joinGasFeeDisplayPct}%`)
		console.log('5. Bid DAI for auction')
		console.log(`	Gas fee: ${dentGasFeeDisplayPct}%`)
		console.log('6. Deal DAI from auction win')
		console.log(`	Gas fee: ${dealGasFeeDisplayPct}%`)
		console.log('7. Exit collateral to Ethereum account')
		console.log(`	Gas fee: ${exitGasFeeDisplayPct}%`)
		console.log('8. Exchange collateral for DAI')
		console.log(`	Slippage: ${slippageDisplayPct}%`)
		console.log(`	Gas fee: ${tradeGasFeeDisplayPct}%`)
		console.log('9. Send DAI to Coinbase')
		console.log('	Fees incurred only once - not included in this calculation')
		console.log('10. Sell DAI to USD')
		console.log('	Fees incurred only once - not included in this calculation')
		console.log('11. Withdraw USD to bank')
		console.log('	No fees incurred')
		console.log(`\nTotal transaction fee: ${trxFeeDisplayPct}%`)
		console.log(`Target gross profit margin: ${targetProfitDisplayPct}%`)
		console.log(`Threshold for bidding: ${thresholdDisplayPct}%`)
	}

	// 7. Calculate bid price, using rates already established
	// Calculate rate as 1/currentRate, because currentRate is obverse of what we need
	const oneFixed = es.FixedNumber.fromString('1')
	let wethRate = oneFixed.divUnsafe(currentRate.rate)
	// Subtract threshold percentage to get percentage adjustment
	let pctAdjustment = oneFixed.subUnsafe(thresholdPct)
	// Calculate bid price
	let bidPrice = wethRate.mulUnsafe(pctAdjustment)
	
	// Log results
	console.log(`\nwethRate: ${wethRate}`)
	console.log(`thresholdPct: ${thresholdPct}`)
	console.log(`pctAdjustment: ${pctAdjustment}`)
	console.log(`bidPrice: ${bidPrice}`)
	// Convert both bid and gas price to strings, so that they're properly converted to JSON output
	let gasPriceStr = gasPriceWei.toString()
	let bidPriceStr = bidPrice.toString()

	// 8. Return final values needed for bidding model
	let o = {
		bidPrice: bidPriceStr,
		gasPrice: gasPriceStr,
	}
	return o
}

/**
 * Checks whether pair exists on Uniswap, and returns a Pair object, if so
 * @param  {@uniswap/sdk} uniswap - External Uniswap library
 * @param  {uniswap.Token} token0 - Object representing a specific token on Uniswap
 * @param  {uniswap.Token} token1 - Object representing a specific token on Uniswap
 * @return {boolean|uniswap.Pair} If no pair exists, then returns false. Otherwise, returns object representing a specific trading pair in Uniswap
 */
async function assignPairIfExists(uniswap, token0, token1) {
	// NOTE: Calling getAddress in Uniswap SDK will return address, even if the contract has not yet been deployed. Therefore, need to call fetchData, which
	// return an error that we can catch
	try {
		var pair = await uniswap.Pair.fetchData(token0, token1)
	} catch (e) {
		// If an error occurs, the function will return false
			return false
	}
	
	// If no error, the function will return the pair
	return pair
}

/**
 * Returns the external market price for two tokens, using a predetermined API
 * @param  {String} inputTokenName - Name of the token that will be traded into Uniswap
 * @param  {String} outputTokenName - Name of the token that will be received back from Uniswap
 * @return {Object} Object containing two decimal values, which are the prices for the input token and output token
 */
async function getCurrentPrices(inputTokenName, outputTokenName) {
	let apiKey = '06773d31ca7b7d1d5fc8f147801144b6'
	// Needed, in case values are not passed in uppercase. URL will not return values if not in upper case
	let inputTokenNameUpper = inputTokenName.toUpperCase()
	let outputTokenNameUpper = outputTokenName.toUpperCase()
	const url = 'https://api.nomics.com/v1/currencies/ticker?key=' + apiKey + '&ids=' + inputTokenNameUpper + ',' + outputTokenNameUpper + '&interval=1d'

	let results = await axios.get(url)
	let currentPrices = {}

	// The API (Nomics) doesn't sort consistently - sometimes alphabetical, sometimes not. Therefore, we loop through and search the "symbol" field
	// Other for loops (in/of) don't return objects, so need to use regular for loop
	for (let i = 0; i < results.data.length; i++) {
		let dataSymbol = results.data[i].symbol
		if (results.data[i].symbol === inputTokenNameUpper) {
			currentPrices.inputTokenPrice = results.data[i].price
		} else if (results.data[i].symbol === outputTokenNameUpper) {
			currentPrices.outputTokenPrice = results.data[i].price
		}
	}

	// Return the USD values of the input/output tokens
	return currentPrices
}

/**
 * Estimate the current gas price on the main network, using a predetermined API
 * @param  {String} feeLevel - The level of gas price we are willing to pay (can be one of five levels)
 * @return {Object|Object} If feeLevel = "all", then an object is returned with gas prices at all levels; if feeLevel is a specific level, then an object is
 * returned with the specified fee level
 */
async function estimateGasPrice(feeLevel) {
	// 1. Stop function if paramater isn't one of the standard options
	let feeLevelOptions = ['safeLow', 'standard', 'fast', 'fastest', 'all']
	if (!feeLevelOptions.includes(feeLevel)) {
		console.log(`The fee level chosen does not match the standard options for EtherChain.
		If you wish to return only one value, please use one of the following options: safeLow, standard, fast, fastest
		If you wish to return all values, please use the folowing option: all`)
		return false
	}

	// 2. Retrieve results
	let url = 'https://www.etherchain.org/api/gasPriceOracle'
	let results = await axios.get(url)

	// 3. Return results
	if (feeLevel === 'all') {
		return results.data
	} else {
		return results.data[feeLevel]
	}	
}

/**
 * Estimate the gas used on specified operations
 * @param  {String} type - The type of operation being completed
 * @param  {Object} options - An object containing additional configuration options (currently, function only checks for tokensInvolved)
 * @return {Number} The estimated gas used, based on pre-determined formulas for each operation type
 */
function estimateGasUsed(type, options = {}) {
	// Uniswap events
	if (type === 'trade') {
		// 1. Stop function if at least 2 tokens aren't involved in trade
		if (options.tokensInvolved < 2) {
			console.log('At least two tokens must be involved in the trade')
			return
		}

		// 2. Calculate the gas used
		// The formula used is a regression, based on data calculated from Etherscan transactions. See documentation at "Uniswap gas costs"
		// Formula last updated: June 20, 2020
		var estimate = (47912 * options.tokensInvolved) + 29876

	// Maker events
	// For all other event types, use a set gas estimate. See documentation at "Maker gas costs"
	} else if (type === 'tend') {
		var estimate = 99897
	} else if (type === 'dent') {
		var estimate = 99289
	} else if (type === 'deal') {
		var estimate = 51654
	} else if (type === 'join') {
		var estimate = 80380
	} else if (type === 'exit') {
		var estimate =  80145
	} else if (type === 'transfer') {
		var estimate = 21000
	}

	return estimate
}

getBestTrade()

module.exports = {
	getBestTrade,
	tradeTokens,
}
