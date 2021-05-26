'use strict'
/* !----1. Set libraries ----! */
//Start libraries
const es = require('ethers')
const fs = require('fs')
const daiAbi = require('./../../abi/daiAbi.js')
const addrFile = require('./../../addr/ethAddr.js')
const trader = require('./uniTradeLib.js')
const secrets = require('./../../../secrets.js')

/* !---- 2. Set chain data ----! */
var provider = new es.providers.JsonRpcProvider(); //default to localhost:8545

/**
 * Trade tokens if needed
 * @param  {void}
 * @output Output giving updates on status of function
 * @return {void}
 */
async function getDaiVatBal() {
	// 1a. Connect to wallet
	// Create wallet from keystore/password
	const temp = await es.Wallet.fromEncryptedJson(secrets.parityAcctKeystore, secrets.parityAcctPassword)
	// Create wallet, with provider as signer
	var wallet = new es.Wallet(temp.privateKey, provider)

	// 1b. Define address
	var addr = addrFile.kovan

	// 1c. Connect to contracts
	var vat = new es.Contract(addr.vat, daiAbi.vat, wallet)

	// 1d. Define address to use
	var address = addr.parity

	// 2. Query Vat balance
	// Decided not to use balance function from python file, because 
	// A. The python function (exit_collateral_on_shutdown) doesn't originally query dai balance
	// B. Querying dai balance in python would call a web3 function. I believe ethers.js can be just as fast as web3
	// C. It's easier to debug by having all function logic in this file.
	let balance = await vat.dai(address)
	let balanceStr = balance.toString()

	console.log('balance: ', balance)

	// 3. Convert to regular ether amount
	// Decimals are 45 places, so fixed format used to add 80 decimals (default only 18)
	let balanceFixed = es.FixedNumber.fromString(balanceStr, 'fixed128x80') 
	let decimals45 = es.FixedNumber.fromString('1000000000000000000000000000000000000000000000', 'fixed128x80')
	let balanceWithDecimals = balanceFixed.divUnsafe(decimals45)

	// Although we use FixedNumber for decimal precision, we need to convert to BigNumber to do comparisons
	// We can always go back to the original FixedNumber for calculation
	let balanceRounded = balanceWithDecimals.round(18)
	let balanceRoundedStr = balanceRounded.toString()

	// Both balanceWei and rebalanceConst are converted to ethers, in BigNumber format, to allow comparisons
	let balanceWei = es.utils.parseUnits(balanceRoundedStr)
	let minBalance = es.utils.parseUnits('100.01') // UPDATE: to do 100

	if (balanceWei.lt(minBalance)) {
		// 1. Exit all collateral from Vat
		// 1a. Find Vat balance
		let ethIlk = '0x4554482d41000000000000000000000000000000000000000000000000000000' // ilk identifier for regular eth
		let gemBalance = await vat.gem(ethIlk, address)
		let gemBalanceStr = gemBalance.toString()

		// 1b. If balance isn't zero, then exit from Vat
		if (gemBalanceStr !== '0') {
			let ethJoin = new es.Contract(addr.ethJoin, daiAbi.ethJoin, wallet)
			let results = await ethJoin.exit(address, gemBalanceStr)
			process.stderr.write(`WETH exited from Vat\n`)
		}

		// 2. Trade required collateral for DAI on Uniswap
		// 1a. Calculate difference as a FixedNumber, so that the rebalance amount can be precise
		let maxBalance = es.FixedNumber.fromString('200', 'fixed128x80')
		let rebalanceAmt = maxBalance.subUnsafe(balanceWithDecimals)

		// 1b. convert rebalanceAmt back to BigNumber
		let rebalanceAmtRound = rebalanceAmt.round(18)
		let rebalanceAmtRoundStr = rebalanceAmtRound.toString()
		let rebalanceWei = es.utils.parseUnits(rebalanceAmtRoundStr) 
		let rebalanceEthers = es.utils.formatUnits(rebalanceWei) // Amounts are in ethers unit value, but that doesn't meant the value is ETH
		let rebalanceEthersStr = rebalanceEthers.toString()
		
		// 1c. Execute trade
		trader.tradeTokens('weth', 'dai', rebalanceEthersStr, 'kovan', 'exactOut')

		process.stderr.write(`${rebalanceEthersStr} DAI will be added to the Vat\n`)
	}
}

getDaiVatBal()