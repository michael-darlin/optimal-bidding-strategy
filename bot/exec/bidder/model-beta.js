#!/usr/bin/env node
'use strict'

/**
 * @file Handles the output of the auction-keeper, by sending it to the getBestTrade function and receiving back the appropriate bid price
 */

/* !---- 1. Create libraries ----! */
const fs = require('fs')
const trader = require('./../trader/uniTradeLib.js')

/* !---- 2. Set up to read stdin ----! */
process.stdin.setEncoding('utf8')

process.stdin.on('readable', () => {
	let chunk

	while ((chunk = process.stdin.read()) !== null) {
		// Ensure file exists. Do sync, so that each "write" call to the file executes in order
		fs.writeFileSync('/home/eth/tempest/maker/exec/bidder/auction-keeper-flip-ETH-A.log', '')

		// Add information to the file
		fs.appendFileSync('/home/eth/tempest/maker/exec/bidder/auction-keeper-flip-ETH-A.log', chunk, err => {
			if (err) return console.log(err)
		})

		readData(chunk)
	}
})

/**
 * Interpret JSON data from auction-keeper, and send to getBestTrade to receive appropriate bidding price
 * @param  {String} chunk output from auction-keeper
 * @output maximum bidding price
 * @return {void}
 */
/* !---- 3. Define function to read data ----! */
async function readData(chunk) {
	let auction = JSON.parse(chunk)

	// Call 1: Get current price
	let bidInfo = await trader.getBestTrade('dai', 'weth', auction.tab, 'kovan')

	// Create JSON string
	let o = {}
	o['price'] = bidInfo.bidPrice
	o['gasPrice'] = bidInfo.gasPrice

	let outputString = JSON.stringify(o)

	// Write to console, which will go to stdout and be read by model
	process.stdout.write(outputString)

	// Log bid in file
	fs.appendFileSync('/home/eth/tempest/maker/exec/bidder/auction-keeper-flip-ETH-A.log', '\n' + outputString)
}