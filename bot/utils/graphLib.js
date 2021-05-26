'use strict'
const lib = require('graphql-request')
const mysql = require('mysql')
const tools = require('../exec/listener/eventLib.js')
const secrets = require('../../secrets.js')
const cliProgress = require('cli-progress')

updateByGraph('deals')

/**
 * Query price results from the Uniswap subgraph on TheGraph.com, and insert to SQL database
 * @param  {String} tableName - Name of SQL table to be updated
 * @output String of SQL query that updated SQL database
 * @return {void}
 */
async function updateByGraph(tableName) {
    // 1. Connect to SQL database
    const con = tools.makeDb({
		host: secrets.host,
		user: secrets.awsUser,
		password: secrets.awsPassword
	})

    // 2. Select all unique block numbers from the three main tables
    console.log('Step 1: Retrieve all unique blocks from the database')
    let query1 = await con.query(`SELECT DISTINCT allTables.blockNumber, allTables.blockTime from (SELECT blockNumber, blockTime FROM main.kicks
        UNION ALL
        SELECT blockNumber, blockTime FROM main.deals
        UNION ALL
        SELECT blockNumber, blockTime FROM main.bids) as allTables ORDER BY allTables.blockNumber ASC`)
    let sqlArr = [`INSERT INTO main.uniReserves (ethReserve, daiReserve, blockNumber, blockTime, contract) VALUES (?, ?, ?, ?, ?)`, []]

    // 3. Start bar for progress updates
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    bar1.start(query1.length, 0)

    // 4. Loop through all results
    for (let i = 0; i < query1.length; i++) {        
        row = query1[i]

        // 4a. Query The Graph
        const gqlQuery = lib.gql`
        {
            exchangeHistoricalDatas(
                where: { 
                    exchangeAddress:"0x2a1530c4c41db0b0b2bb646cb5eb1a67b7158667" 
                }, 
                orderBy: timestamp, 
                orderDirection: desc,
                block: {
                    number: ${row.blockNumber}
                },
                first: 1
            ) {
                ethBalance
                tokenBalance
                timestamp
            }
        }
        `
        let results = await lib.request('https://api.thegraph.com/subgraphs/name/graphprotocol/uniswap', gqlQuery)

        // 4b. Collect data
        // i. Reserves
        let uniEthReserve = results.exchangeHistoricalDatas[0].ethBalance
        let uniDaiReserve = results.exchangeHistoricalDatas[0].tokenBalance
        // ii. Contract
        let contract = 2

        sqlArr[1].push([uniEthReserve, uniDaiReserve, row.blockNumber, row.blockTime, contract])

        // 4c. Update bar
        bar1.update(i+1)
    }

    // No further updates
    bar1.stop()

    // 5. Update SQL database (uniReserves) with the reserves for each relevant block
    // 5a. Set necessary variables
    let sqlLog = ''
    console.log('\nStep 2: Record to SQL database')

    // 5b. Loop through final SQL statements
    for (let i = 0; i < sqlArr[1].length; i++) {
        // i. Append query to a string
        let string = mysql.format(sqlArr[0], sqlArr[1][i])
        sqlLog += string + '\n\n'
        // ii. Execute query
        // con.query(string)
    }
    
    // 5c. Close connection
    await con.close()
    console.log(sqlLog)
}