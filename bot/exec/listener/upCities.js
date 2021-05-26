'use strict'
/**
 * @file Queries the SQL database for any addresses not yet associated to a city. If an address is unassociated, the file initiates an UPDATE query to
 * associate the address with a randomly-selected city
 */

//0. Preliminary definitions
//Start libraries
const cliProgress = require('cli-progress')
const fs = require('fs')
const mysql = require('mysql');
const secrets = require('./../../../secrets.js')

//Variables to add to later
let params = []
let query3 = ''

// 1. Set chain variable, based on CLI arguments
const args = process.argv.slice(2)
if (args[0] == 'main') {
	var chain = 'main'
} else {
	var chain ='kovan'
}
console.log(`Cities update\nChain: ${chain}`)

// 2. Create SQL connection
var con = mysql.createConnection({
	host: secrets.host,
	user: secrets.awsUser,
	password: secrets.awsPassword
});
con.connect(function(err) { if (err) throw err; });

// 3. Select addresses
let query1 = `SELECT address FROM ${chain}.topAddrLeaderBoard t1 WHERE NOT EXISTS (SELECT address FROM other.cityNames t2 WHERE t1.address = t2.address)`

//Empty results are handled by if statements. Errors will not results from empty SQL results.
con.query(query1, function(err, results1) {
	if (err) throw err
	//If query1 returns nothing (length 0), then this loop will not run, and the next queries will not execute.
	if (results1.length > 0) {
		for (let i = 0; i < results1.length; i++) {
			params.push([results1[i]['address'], ''])
		}

		let query2 = "SELECT * FROM other.cityNames WHERE address IS NULL"
		con.query(query2, function(err, results2) {
			if (err) throw err
			//If query2 returns nothing (length 0), then this loop will not run
			if (results2.length > 0) {
				for (let i = 0; i < results1.length; i++) {
					params[i][1] = results2[i]['ID']
				}

				//If query1 returns nothing (length 0), then params will also have length 0. Therefore, this loop will not run
				for (let j = 0; j < params.length; j++) {
					query3 = mysql.format('UPDATE other.cityNames SET address = ? WHERE id = ?; ', params[j]);
					con.query(query3, function(err, results3) {
						if (err) throw err
						console.log((j + 1) + ' of ' + params.length + ': address ' + params[j][0] + ' associated to city ' + params[j][1] + '\n')
					})
				}
				con.end(function(err) { if (err) throw err; })
			} else {
				console.log('No more cities are free to be assigned to\n')
				con.end(function(err) { if (err) throw err; })
			}
		})
	} else {
		console.log('No new addresses to assign\n')
		con.end(function(err) { if (err) throw err; })
	}
})
