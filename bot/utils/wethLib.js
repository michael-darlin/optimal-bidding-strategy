'use strict'
/* !----1. Set libraries ----! */
// Start libraries
const abi = require('./../abi/tokenAbi.js')
const es = require('ethers')
const fs = require('fs')
const secrets = require('./../../secrets.js')
var addr = require('./../addr/ethAddr.js')
const yargs = require('yargs').default({
	chain: 'kovan',
	type: 'wrap',
	amount: 1,
})

/* !---- 2. Set chain data ----! */
// Set addresses, based on user selection of Main or Kovan
const args = yargs.argv
if (args.chain === 'main') {
	addr = addr.main
	let provider = new es.providers.InfuraProvider('homestead', secrets.infuraKey)
} else {
	addr = addr.kovan
	var provider = new es.providers.JsonRpcProvider(); //default to localhost:8545
}

convertWeth(args.type, args.amount)

/**
 * Converts WETH to ETH, and vice-versa
 * @param  {String} type - Type of conversion (either "wrap" for ETH -> WETH, or "unwrap" for WETH -> ETH)
 * @param  {Number} [amount="all"] - Object representing a specific token on Uniswap
 * @return {boolean|void} If certain checks fail, the function will return FALSE. If the function completes successfully, no value is returned.
 */
async function convertWeth(type, amount = 'all') {
	// 0. Connect to WETH contract
	// Create wallet from keystore/password
	const temp = await es.Wallet.fromEncryptedJson(secrets.parityAcctKeystore, secrets.parityAcctPassword)
	// Create wallet, with provider as signer
	const wallet = new es.Wallet(temp.privateKey, provider)
	// Connect to contract with the wallet, so that we can sign transactions
	const weth = new es.Contract(addr.weth, abi.weth, wallet)
	console.log('Connected to WETH contract')

	let curBal = ''; let ethCost = ''; let convertAmt =''; let currency = ''; let curEthBal = ''
	// 1. Set opening variables
	// Set current balance for the relevant currency, as well as the current ETH balance (which may or may not be the same currency)
	if (type === 'wrap') {
		curBal = await provider.getBalance(addr.parity)
		currency = 'ETH'
	} else if (type === 'unwrap') {
		curBal = await weth.balanceOf(addr.parity)
		currency = 'WETH'
	} else {
		return false
	}

	// Check A: If the current balance of the currency in the account is 0, then the amount cannot be converted
	if (curBal.eq(0)) {
		console.log(`The balance of ${currency} in this account is 0. No transfer has been made.`)
		return false
	}

	// 2. Set the amount to be converted
	if (amount === 'all') {
		convertAmt = curBal
		// Warn that all ETH will be taken out of account.
		if (type === 'wrap') {
			console.log('A small amount of ETH will be left over, in order to pay the gas costs for unwrapping WETH back to ETH')
		}
	} else {
		convertAmt = es.utils.parseUnits(amount.toString(), 'ether')
		// Check B: if the amount to be converted is not 'all', and the amount is greater than the current balance of the currency in the account, then the
		// amount cannot be converted
		if (convertAmt.gt(curBal)) {
			let convertAmtEth = es.utils.commify(es.utils.formatUnits(convertAmt, 'ether'))
			let curBalEth = es.utils.commify(es.utils.formatUnits(curBal, 'ether'))
			console.log(`The amount of ${currency} to be converted (${convertAmtEth}) is great than the amount of ${currency} in this account (${curBalEth}). No transfer has been made.`)
			return false
		}
	}

	// 3. Set the gas options
	console.log('Setting gas options')
	const currentGas = await provider.getGasPrice()
	const gasLimit = es.utils.parseUnits('50000', 'wei')

	const options = {
		gasLimit:	es.utils.hexlify(gasLimit),
		gasPrice:	es.utils.hexlify(currentGas),
	}
	// The maximum cost is the gas price * gas limit
	const maxGas = currentGas.mul(gasLimit)

	// If wrapping all ETH, then reset the convertAmt, factoring in gas cost needed to execute transaction.
	// Subtract maxGas twice, because we want to leave enough for the user to unwrap WETH back to ETH.
	if (type === 'wrap' && amount === 'all') {
		convertAmt = convertAmt.sub(maxGas.add(maxGas))
	}

	// 4. Define total costs in ETH
	// If we are sending WETH -> ETH, then our total cost in ETH is the amount to be converted + gas costs
	if (type === 'wrap') {
		ethCost = convertAmt.add(maxGas)
		curEthBal = curBal
	} else {
		// If we are converting WETH -> ETH, then our total cost in ETH is only the gas costs
		ethCost = maxGas
		curEthBal = await provider.getBalance(addr.parity)
	}

	// Check C: If the ETH cost is greater than the current ETH balance in the account, then the transaction cannot be executed
	if (ethCost.gt(curEthBal)) {
		console.log('Not enough ETH to cover the transaction cost. No transfer has been made')
		let ethBalGwei = es.utils.commify(es.utils.formatUnits(curEthBal, 'gwei'))
		let ethCostGwei = es.utils.commify(es.utils.formatUnits(ethCost, 'gwei'))
		console.log(`ETH balance is ${ethBalGwei} gwei`)
		console.log(`Cost of transaction (including ETH converted) is ${ethCostGwei} gwei`)
		return false
	}

	// 5. Finalize the transaction
	console.log('Sending transaction')
	if (type === 'wrap') {
		const tx = await weth.deposit({value: convertAmt})
		const receipt = await tx.wait()
		console.log('Transaction hash:', receipt.transactionHash)

		let convertAmtEth = es.utils.commify(es.utils.formatUnits(convertAmt, 'ether'))
		console.log(`${convertAmtEth} ETH successfully converted to WETH`)
	} else {
		const tx = await weth.withdraw(convertAmt,options)
		const receipt = await tx.wait()
		console.log('Transaction hash:', receipt.transactionHash)

		let convertAmtEth = es.utils.commify(es.utils.formatUnits(convertAmt, 'ether'))
		console.log(`${convertAmtEth} WETH successfully converted to ETH`)
	}
}

