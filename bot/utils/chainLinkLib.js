'use strict'
const es = require('ethers')
const linkAbi = require('../abi/linkAbi.js')
const addrFile = require('../addr/ethAddr.js')
const mysql = require('mysql')
const cliProgress = require('cli-progress')
const tools = require('../exec/listener/eventLib.js')
const secrets = require('../../secrets.js')

// blockNumber = 10600000
// decrement = 1443953 (to get to the first block after ETH-USD pair stopped collecting data)
getPrice(10600000)

/**
  * Query price results from a Chainlink contract (ETH-USD or DAI-USD, depending on what version of the contract), and insert to SQL database
 * @param  {Number} blockNumber - The first block to query events on the Chainklink contract
 * @output String of SQL query that updated SQL database
 * @return {void} 
 */
async function getPrice(blockNumber) {
/* !---- 1. Declare variables ----! */
    // Bar for progress updates (useful when pulling in hundred of transactions)
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    console.log('Step 1: Retrieve data from the blockchain')

    // Connect provider
    // NOTE: no plans to expand this functionality to Kovan (unsure what the addresses are, and not really worth it)
    // If Kovan is added, then will add functionality to choose main or kovan (using yargs)
    let provider = new es.providers.InfuraProvider('homestead', secrets.infuraKey)
    const addr = addrFile.main

    // Create SQL array that will function as insert string
    const con = tools.makeDb({
		host: secrets.host,
		user: secrets.awsUser,
		password: secrets.awsPassword
	})
    let sqlArr = [`INSERT INTO main.linkPrices (price, blockNumber, blockTime, round, contract) VALUES (?, ?, STR_TO_DATE(?, '%c/%e/%Y, %r'), ?, ?)`, []]

    // Create 
    let decrement = 757456

/* !---- 2. Define which contract to query ----! */
    // The ETH-DAI contract had its first non-deployment transaction at block 9,156,074. Therefore, any block before 9,156,074 will go to the existing contract 
    // (ETH-USD)
    // A. Contract 1
    if (blockNumber <= 9156074) {
        // A1. Download all results
        var priceFeed = new es.Contract(addr.ethUsdOld, linkAbi.v1Contract, provider)
        let results = await priceFeed.queryFilter('AnswerUpdated', blockNumber - decrement, blockNumber)

        // Start progress bar
        bar1.start(results.length, 0)
        
        // A2. Loop each individual event
        for (let i = 0; i < results.length; i++) {
            // Pause, so that requests aren't canceled
            await sleep(40)

            // A2.1 Skip any events that aren't the last event in the round
            // First ensure that i isn't on the last iteration, so we can compare to i to i+1 event
            if (i + 1 < results.length) {
                // Skip this event if it's not the last event in this round. In other words, only the last event in the round is recorded
                // If a round streches over multiple blocks, and the loop ends in the middle of those blocks, then the round will be double-recorded (once in the
                // first loop, and then again in the second loop). However, the efficiency loss is small
                if (results[i].args.answerId.toString() === results[i+1].args.answerId.toString()) {
                    continue
                }
            }

            let event = results[i]

            // A2.2 Collect the following data for the SQL database
            // A. Price
            let price = event.args.current.toString()
            price = price / 100000000 // chainLink multiplies USD pairs by this amount, so divide back to the actual price
            // B. blockNumber
            let blockNumber = event.blockNumber
            // C. Timestamp (can only be obtained from getBlock function - Transaction and Transaction Receipt don't work)
            let block = await event.getBlock()
            let blockTime = block.timestamp
            let blockDate = new Date(blockTime * 1000)
            let time = blockDate.toLocaleString('en-US', {timeZone: 'America/New_York'})
            // D. Round
            let round = event.args.answerId.toString()
            // E. Contract (manual)
            let contract = 1

            // A2.3 Add to SQL array
            sqlArr[1].push([price, blockNumber, time, round, contract])

            // A2.4 Update bar 
            bar1.update(i+1)
        }
        
        // No further updates
        bar1.stop()
    // B. Contract 2
    } else {
        // B1. Download all results
        var priceFeed = new es.Contract(addr.daiUsd, linkAbi.v2Contract, provider)
        let results = await priceFeed.queryFilter('AnswerUpdated', blockNumber - decrement, blockNumber)
        
        // Start progress bar
        bar1.start(results.length, 0)

        // B2. Loop through results
        for (let i = 0; i < results.length; i++) {
            let event = results[i]
            // B2.1 Skip any events that aren't the last event in the round
            if (i + 1 < results.length) {
                if (results[i].args.roundId.toString() === results[i+1].args.roundId.toString()) {
                    continue
                }
            }

            // B2.2 Collect the following data for the SQL database
            // A. Price
            let price = event.args.current.toString()
            price = price / 100000000
            // B. blockNumber
            let blockNumber = event.blockNumber
            // C. Timestamp (can only be obtained from getBlock function - Transaction and Transaction Receipt don't work)
            let timestamp = event.args.timestamp.toString()
            let milliseconds = timestamp * 1000
            let dateObject = new Date(milliseconds)
            let time = dateObject.toLocaleString('en-US', {timeZone: 'America/New_York'})
            // D. Round
            let round = event.args.roundId.toString()
            // E. Contract (manual)
            let contract = 4

            // B2.3 Add to SQL array
            sqlArr[1].push([price, blockNumber, time, round, contract])

            // B2.4 Update bar 
            bar1.update(i+1)
        }

        // No further updates
        bar1.stop()
    }

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
        // con.query(string)
    }
    
    // C. Close connection
    await con.close()
    console.log(sqlLog)
}

/**
 * Pause execution for a specified number of milliseconds
 * @param  {Number} Number of milliseconds to wait
 * @return {void}
 */
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }