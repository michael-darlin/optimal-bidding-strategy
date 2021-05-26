'use strict'
const mysql = require('mysql')
const tools = require('../exec/listener/eventLib.js')
const secrets = require('../../secrets.js')
const cliProgress = require('cli-progress')

updateUniCols('deals')

/**
 * Set the value of uniEthReserve and uniDaiReserve columns for all event tables in SQL (based on data already recorded in SQL)
 * @param  {String} tableName - Name of SQL table to be updated
 * @output N/A
 * @return {void}
 */
async function updateUniCols(tableName) {
    /* !---- 1. Declare variables ----! */
    // Connect to SQL
    const con = tools.makeDb({
		host: secrets.host,
		user: secrets.awsUser,
		password: secrets.awsPassword
	})
    
    let query1 = await con.query(`SELECT * FROM main.${tableName}`)

    // Bar for progress updates
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    bar1.start(query1.length, 0)

    for (let i = 0; i < query1.length; i++) {
        let row = query1[i]

        // Select all reserve amounts linked to that block. Ordering by constantProduct ensures that the first result has the largest liquidity
        let query2 = await con.query(        
            `SELECT * FROM main.uniReserves where blockNumber = ${row.blockNumber} ORDER BY constantProduct DESC;`
        )

        let ethReserve = query2[0].ethReserve
        let daiReserve = query2[0].daiReserve
        
        let string = `UPDATE main.${tableName} SET uniEthReserve = ${ethReserve}, uniDaiReserve = ${daiReserve} WHERE ID = ${row.ID}`
        con.query(string)

        bar1.update(i+1)
    }
    
    // No further updates
    bar1.stop()

    // C. Close connection
    await con.close()
}

/**
 * Set the value of linkPrice column for all event tables in SQL (based on data already recorded in SQL)
 * @param  {String} tableName - Name of SQL table to be updated
 * @output N/A
 *  * @return {void}
 */
async function updateLinkCols(tableName) {
/* !---- 1. Declare variables ----! */
    // Create SQL array that will function as insert string
    const con = tools.makeDb({
		host: secrets.host,
		user: secrets.awsUser,
		password: secrets.awsPassword
	})
    
    // Get this amount
    let price = 0
    let blockNumber = 0
    let time = ''

    let query1 = await con.query(`SELECT * FROM main.${tableName}`)

    // Bar for progress updates
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    bar1.start(query1.length, 0)

    for (let i = 0; i < query1.length; i++) {
        let row1 = query1[i]
        let query2 = await con.query(        
            `SELECT a.ID, a.price, a.blockNumber, a.round, a.contract, a.blockTime
            FROM main.linkPrices a
            INNER JOIN (
                SELECT contract, MAX(blockNumber) blockNumber, max(round) round
                FROM main.linkPrices
                WHERE blockNumber <= ${row1.blockNumber} AND (contract = 2 OR contract = 1)
                GROUP BY contract
            ) b ON a.blockNumber = b.blockNumber AND a.round = b.round;`
        )

        for (let j = 0; j < query2.length; j++) {
            let row2 = query2[j]
            if (row1.blockNumber < 9156047) {
                if (row2.contract === 1) {
                    price = row2.price
                    break
                }
            } else {
                if (row2.contract === 2) {
                    price = row2.price
                    break
                }
            }
        }

        let string = `UPDATE main.${tableName} SET linkPrice = ${price} WHERE ID = ${row1.ID}`
        con.query(string)

        bar1.update(i+1)
    }
    
    // No further updates
    bar1.stop()

    // C. Close connection
    await con.close()
}