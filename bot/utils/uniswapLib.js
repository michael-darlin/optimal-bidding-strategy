'use strict'
/* !----1. Set libraries ----! */
//Start libraries
const es = require('ethers')
const cliProgress = require('cli-progress')
const abi = require('./../../abi/uniAbi.js')
const etherScan = require('./etherScan.js')
var addr = require('./../../addr/ethAddr.js')
const yargs = require('yargs').default({
	chain: 'kovan',
})
const mysql = require('mysql')
const tools = require('../exec/listener/eventLib.js')
const secrets = require('../../secrets.js')

/* !---- 2. Set chain data ----! */
//Set addresses, based on user selection of Main or Kovan
const args = yargs.argv
if (args.chain === 'main') {
	addr = addr.main
	let provider = new es.providers.InfuraProvider('homestead', secrets.infuraKey)
	var oldestBlock = 10000000 // Uniswap V2 doesn't start until after 10M blocks
} else {
	addr = addr.kovan
	var provider = new es.providers.JsonRpcProvider(); //default to localhost:8545
	var oldestBlock = 18000000 // Uniswap V2 doesn't start until after 18M blocks
}

/* !---- 3. Create beginning variables/constants ----! */
const factory = new es.Contract(addr.factory, abi.factory, provider) // Must call with provider in order to be able to access 

//bar for progress updates (useful when pulling in hundred of transactions)
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

/**
 * Returns information on all pairs in Uniswap, by retrieving all "PairCreated" events from the Factory contract
 * @param  {ethers.Contract} factory - Connection to the Uniswap Factory contract
 * @param  {Number} oldestBlock - The first block to query events on the Factory contract
 * @param  {Number} [newestBlock=0] - The last block to query events on the Factory contract. The default is 0, which leads to newestBlock being assigned the 
 * value of the most recent block on the chain
 * @output Information on all pairs captured by the function
 * @return {void} 
 */
async function getAllPairs(factory, oldestBlock, newestBlock=0) {
	let data = ''
	if (newestBlock === 0) {
		var newestBlock = await provider.getBlockNumber()
	}

	console.log(`Getting pairs from block ${oldestBlock} to ${newestBlock}`)

	const events = await factory.queryFilter("PairCreated", oldestBlock, newestBlock)

	console.log(`Events received: ${events.length}`)

	//Start progress bar
     	bar1.start(events.length, 0)

	for (let i = 0; i < events.length; i++) {
		// Pause execution 50 milliseconds (0.05 seconds), so as not to exceed Etherscan's call limit (5 every second)
		await etherScan.sleep(40)

		// Final: update bar
		bar1.update(i+1)

		let event = events[i]
		let token0 = await etherScan.getTokenName(event.args.token0, args.chain)
		let token0supply = await etherScan.getTokenSupply(event.args.token0, args.chain)
		let token1 = await etherScan.getTokenName(event.args.token1, args.chain)
		let token1supply = await etherScan.getTokenSupply(event.args.token1, args.chain)
		let pairAddr = event.args.pair

		// Note that token0 and token1 are arrays, but they automatically output all array values, along with commas, which fits the csv ouput we want
		data += token0 + ',' + token0supply + ',' + token1 + ',' + token1supply + ',' +  pairAddr + ','
	}

	// Stop progress bar
	bar1.stop()

	console.log(data)
}

/**
 * Query price results from the ETH-DAI Uniswap V2 contract, and insert to SQL database
 * @param  {void}
 * @output String of SQL query that updated SQL database
 * @return {void}
 */
async function updateByPair() {
	// 1. Connect to SQL database
	const con = tools.makeDb({
		host: secrets.host,
		user: secrets.awsUser,
		password: secrets.awsPassword
	})

	// 2. Select all unique block numbers from the three main tables
	// Filter out blockNumbers before 10,095,742, because V2 contract was not deployed until then
	console.log('Step 1: Retrieve all unique blocks from the database')
	let query1 = await con.query(
		`SELECT DISTINCT allTables.blockNumber, allTables.blockTime from (SELECT blockNumber, blockTime FROM main.kicks 
		WHERE blockNumber >=10095742
		UNION ALL
		SELECT blockNumber, blockTime FROM main.deals WHERE blockNumber >=10095742
		UNION ALL
		SELECT blockNumber, blockTime FROM main.bids WHERE blockNumber >=10095742) as allTables 
		ORDER BY allTables.blockNumber ASC`)
	let sqlArr = [`INSERT INTO main.uniReserves (ethReserve, daiReserve, blockNumber, blockTime, contract) VALUES (?, ?, ?, ?, ?)`, []]

	console.log('Step 2: Find reserves for each relevant block')
	// 3. Start bar for progress updates
	const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
	bar1.start(query1.length, 0)

	// 4. Start blockchain connection
    // NOTE: no plans to expand this functionality to Kovan (unsure what the addresses are, and not really worth it)
    // If Kovan is added, then will add functionality to choose main or kovan (using yargs)
    let provider = new es.providers.InfuraProvider('homestead', secrets.infuraKey)
    var addr = addr.main
	let pair = new es.Contract(addr.ethDaiPairV2, abi.pairV2, provider)
	
	// 5. Get latest reserves for each blockNumber
    for (let i = 0; i < query1.length; i++) {
		let row = query1[i]

		let beginBlock = row.blockNumber - 1000
		let endBlock = row.blockNumber
		let results = await pair.queryFilter('Sync', beginBlock, endBlock)

        // 5a. Define event (most recent sync)
		let event = results[results.length - 1]

		// 5b. Collect values for SQL
		// i. Reserves
		let daiReserveBN = results[0].args.reserve0
		let ethReserveBN = results[0].args.reserve1

		let daiReserveFN = es.FixedNumber.from(daiReserveBN)
		let ethReserveFN = es.FixedNumber.from(ethReserveBN)

		let decimals18 = es.FixedNumber.from('1000000000000000000') // The values are given with 18 extra decimal places, so divide to get to the actual number
		let daiReserveActual = daiReserveFN.divUnsafe(decimals18)
		let ethReserveActual = ethReserveFN.divUnsafe(decimals18)
		let daiReserveActualStr = daiReserveActual.toString()
		let ethReserveActualStr = ethReserveActual.toString()

		// ii. Contract
		let contract = 2

        // 5c. Add values to SQL array
        sqlArr[1].push([ethReserveActualStr, daiReserveActualStr, row.blockNumber, row.blockTime, contract])
        
        // 5d. Update bar 
        bar1.update(i+1)
    }
    
    // 6. Stop bar updates
    bar1.stop()

	// 7. Record to SQL database
    // A. Set necessary variables
    let sqlLog = ''
    console.log('\nStep 3: Record to SQL database')

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