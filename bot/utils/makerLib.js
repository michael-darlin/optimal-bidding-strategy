'use strict'
const es = require('ethers')
const daiAbi = require('../abi/daiAbi.js')
const addrFile = require('../addr/ethAddr.js')
const mysql = require('mysql')
const cliProgress = require('cli-progress')
const tools = require('../exec/listener/eventLib.js')
const secrets = require('../../secrets.js')

getMedianPrices(8957660, 10600000)

/**
  * Query price results from from Maker's DAI-ETH Median contract, and insert to SQL database
 * @param  {Number} beginBlock - The first block to query events on the Maker contract
 * * @param  {Number} endBlock - The last block to query events on the Maker contract
 * @output String of SQL query that updated SQL database
 * @return {void} 
 */
async function getMedianPrices(beginBlock, endBlock) {
/* !---- 1. Declare variables ----! */
    // Bar for progress updates (useful when pulling in hundred of transactions)
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    console.log('Step 1: Retrieve data from the blockchain')

    // Connect to provider (SQL only)
    let provider = new es.providers.InfuraProvider('homestead', secrets.infuraKey)
    const addr = addrFile.main

    // Create SQL array that will function as insert string
    const con = tools.makeDb({
		host: secrets.host,
		user: secrets.awsUser,
		password: secrets.awsPassword
	})
    
    let sqlArr = [`INSERT INTO main.linkPrices (price, blockNumber, blockTime, round, contract) VALUES (?, ?, STR_TO_DATE(?, '%c/%e/%Y, %r'), ?, ?)`, []]
    
    var priceFeed = new es.Contract(addr.medianEthUsd, daiAbi.medianEthUsd, provider)
    let results = await priceFeed.queryFilter('LogMedianPrice', beginBlock, endBlock)

    // Start progress bar
    bar1.start(results.length, 0)

    for (let i = 0; i < results.length; i++) {

        // 1. Define event
        let event = results[i]

        // 2. Collect values for SQL
        // A. Price
        let price = event.args.val.toString()
        let priceBN = es.BigNumber.from(price)
        let priceNum = es.utils.formatUnits(priceBN, 'ether')
        // B. blockNumber
        let blockNumber = event.blockNumber
        // C. Timestamp (can only be obtained from getBlock function - Transaction and Transaction Receipt don't work)
        let blockTime = event.args.age.toString()
        let blockDate = new Date(blockTime * 1000)
        let time = blockDate.toLocaleString('en-US', {timeZone: 'America/New_York'})
        // D. Round (not applicable for Maker)
        let round = 0
        // E. Contract
        let contract = 5

        // 3. Add values to SQL array
        sqlArr[1].push([priceNum, blockNumber, time, round, contract])
        
        // 4. Update bar 
        bar1.update(i+1)
    }
    
    // No further updates
    bar1.stop()

/* !---- 3. Log results to SQL ----! */
    // A. Set necessary variables
    let sqlLog = ''
    console.log('\nStep 2: Record to SQL database')

    // B. Loop through final SQL statements, and perform final functions
	for (let i = 0; i < sqlArr[1].length; i++) {
		// 1. Append query to a string, to write to a file
		let string = mysql.format(sqlArr[0], sqlArr[1][i])
		sqlLog += string + '\n\n'
		// 2. Execute query
        con.query(string)
    }
    
    // C. Close connection
    await con.close()
    console.log(sqlLog)
}