'use strict'
/**
 * @file Fetchs all new auction events, using the functions of eventLibs.js
 */

/* !----1. Set libraries ----! */
//Start libraries
const abi = require('./../../abi/daiAbi.js')
const tools = require('./eventLib.js')
const w3Lib = require('web3')
const mysql = require('mysql')
const secrets = require('./../../../secrets.js')
var addr = require('./../../addr/ethAddr.js')

/* !---- 2. Set chain data ----! */
//Set addresses, based on user selection of Main or Kovan
const args = process.argv.slice(2)
if (args[0] == 'main') {
	var chain = 'main'
	addr = addr.main
	var w3 = new w3Lib(new w3Lib.providers.HttpProvider(`https://mainnet.infura.io/v3/${secrets.infuraKey}`));
} else {
	var chain ='kovan'
	addr = addr.kovan
	var w3 = new w3Lib(new w3Lib.providers.HttpProvider('http://localhost:8545'));
}
console.log(`Events update\nChain: ${chain}`)

if (args[1] == 'main') {
	var db = 'main'
} else if (args[1] == 'kovan') {
	var db = 'kovan'
} else {
	var db = 'test'
}

// Get instance of contracts
const flipContract = new w3.eth.Contract(abi.flipper, addr.ethFlip);
const osmContract = new w3.eth.Contract(abi.osm, addr.osm);
const catContract = new w3.eth.Contract(abi.cat, addr.cat);

//Call to get auctions and update SQL database
fetchAuctions()

/**
 * Downloads all recent auction events, and adds them to the blockchain, using the functions in eventLib.js
 * @param  {void}
 * @return {void}
 */
async function fetchAuctions() {
	const con = tools.makeDb({
		host: secrets.host,
		user: secrets.awsUser,
		password: secrets.awsPassword
	})
	
	try {
		let lastEthBlock = await w3.eth.getBlockNumber()
		let lastSqlBlock = await tools.getLastSqlBlock(chain, con)
		let chainEvents = await tools.getFlipEvents(lastEthBlock, lastSqlBlock, flipContract)
		await tools.showEvents(chain, chainEvents, w3, osmContract, con)
	} catch (err) {
		console.log(err)
	} finally {
		await con.close()
	}
}
