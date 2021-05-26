module.exports = {
	getOsmEvents: getOsmEvents,
	getFlipEvents: getFlipEvents,
	showEvents: showEvents,
	makeDb: makeDb,
	getLastSqlBlock: getLastSqlBlock,
}

// Source: http://stackoverflow.com/questions/497790
var dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    },
    inRange:function(d,start,end) {
        // Checks if date in d is between dates in start and end.
        // Returns a boolean or NaN:
        //    true  : if d is between start and end (inclusive)
        //    false : if d is before start or after end
        //    NaN   : if one or more of the dates is illegal.
        // NOTE: The code inside isFinite does an assignment (=).
       return (
            isFinite(d=this.convert(d).valueOf()) &&
            isFinite(start=this.convert(start).valueOf()) &&
            isFinite(end=this.convert(end).valueOf()) ?
            start <= d && d <= end :
            NaN
        );
    }
}

/**
 * Promisify a mysql connection, so that queries can be called with await
 * @param  {Object} config - option to configure MySQL connection (host, user, password, etc.)
 * @return {Object} Object contains query as a Promise, and a function to close the connection
 */
function makeDb(config) {
	const mysql = require('mysql');
	const util = require('util')
	const connection = mysql.createConnection(config)
	return {
		query(sql, args) {
			return util.promisify(connection.query)
			.call(connection, sql, args)
		},
		close() {
			return util.promisify(connection.end).call(connection);
		}
	}
}

/**
 * Get the price in the given block number and populate last price global variable
 * @param  {Number} blockNumber - specific block number to query
 * @param  {ethers.Contract} osmContract - Connection to the OSM contract for the Maker project
 * @return {Array} Array containing all "LogValue" events in the specified block range
 */
function getOsmEvents(blockNumber, osmContract) {
	let priorPrices = 1000000;	// How many blocks to go back, to pick up a Maker OSM price. Need to go back so far in time because the OSM contract was not						// poked for a month or more, in May 2020.
	let beginBlock = blockNumber - priorPrices
	let endBlock = blockNumber

	return osmContract.getPastEvents("LogValue", {
		fromBlock: beginBlock,
		toBlock: endBlock
	})
}

/**
 * Get new events and populate last events global variable
 * @param  {Number} lastEthBlock - current block on the Ethereum blockchain
 * @param  {Number} lastSqlBlock - most recent block that has been recorded in the SQL database
 * @param  {ethers.Contract} flipContract - Connection to the FLIP_ETH contract for the Maker project
 * @return {Array} Array containing all events in the specific block range
 */
function getFlipEvents(lastEthBlock, lastSqlBlock, flipContract) {
	let beginBlock = lastSqlBlock
	let endBlock = lastEthBlock

	console.log(`Getting auction events from block ${beginBlock} to ${endBlock}`);
	return flipContract.getPastEvents("allEvents", {
		fromBlock: beginBlock,
		toBlock: endBlock
	},
	function (err, result) {
		if (!err) {
			console.log("Received Events:", result.length);
		} else {
			console.log(err);
		}
	})
}

/**
 * most recent block that has been recorded in the SQL database
 * @param  {String} chain - Name of chain (main or kovan)
 * @param  {Number} con - Connection to an SQL database
 * @return {Number|Number} Returns either the most recent blocknumber, or 0 if no results are found
 */
async function getLastSqlBlock(chain, con) {
	try {
		let query = `(SELECT blockNumber FROM ${chain}.kicks ORDER BY blockNumber DESC LIMIT 1) UNION (SELECT blockNumber FROM ${chain}.bids ORDER BY blockNumber DESC LIMIT 1) UNION (SELECT blockNumber FROM ${chain}.deals ORDER BY blockNumber DESC LIMIT 1) UNION (SELECT blockNumber FROM ${chain}.other ORDER BY blockNumber DESC LIMIT 1) ORDER BY blockNumber DESC Limit 1`;

		results = await con.query(query)
		if (results.length > 0) {
			return results[0].blockNumber
		} else {
			return 0
		}
	} catch (err) {
		console.log(err)
	}
}

/**
 * Parse auction events and update SQL database, if needed
 * @param  {String} chain - Name of chain to connect to (main or kovan)
 * @param  {Array} events - Array of auction events occurring within a previously-defined block range
 * @param  {Object} w3 - Connection to a specific Ethereum provider
 * @param  {ethers.Contract} osmContract - Connection to the OSM contract for the Maker project
 * @param  {Number} con - Connection to a SQL database
 * @output String containing UPDATE queries for SQL, if needed
 * @return {void}
 */
async function showEvents(chain, events, w3, osmContract, con) {
/* !---- 1. Define libraries ----! */
	// Define libraries
	const mysql = require('mysql');

/* !---- 2. Set variables for querying chain and SQL ----! */
	// Events type signatures to be processed
	const eventTypeArr = [
		{name: 'TEND', hash: '0x4b43ed1200000000000000000000000000000000000000000000000000000000'},
		{name: 'DENT', hash: '0x5ff3a38200000000000000000000000000000000000000000000000000000000'},
		{name: 'DEAL', hash: '0xc959c42b00000000000000000000000000000000000000000000000000000000'},
		{name: 'TICK', hash: '0xfc7b6aee00000000000000000000000000000000000000000000000000000000'},
		{name: 'FILE', hash: '0x29ae811400000000000000000000000000000000000000000000000000000000'},
		{name: 'DENY', hash: '0x9c52a7f100000000000000000000000000000000000000000000000000000000'},
		{name: 'RELY', hash: '0x65fae35e00000000000000000000000000000000000000000000000000000000'}
	]

	const configArray = [
		{name: 'BEG', hash: '0x6265670000000000000000000000000000000000000000000000000000000000'},
		{name: 'TAU', hash: '0x7461750000000000000000000000000000000000000000000000000000000000'},
		{name: 'TTL', hash: '0x74746c0000000000000000000000000000000000000000000000000000000000'}
	];

	const ETH_ILK = '0x4554482d41000000000000000000000000000000000000000000000000000000';

	//Other variables
	let fileLoc = '/home/eth/tempest/auctions/auctions.log' //file location to write output
	let queryDb = chain
	let insertDb = chain
	let sqlLog = '' //needs to be added to later on
	let eventLog = ''

	// SQL statements
	var sqlArr = {
		kicks : [`INSERT INTO ${insertDb}.kicks (eventType, blockTime, blockNumber, address, trxHash, gasPrice, gasUsed, auctionID, osmPrice, lot, lotType, tab, tabType) VALUES (?, STR_TO_DATE(?, '%c/%e/%Y, %r'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, []],
		bids : [`INSERT INTO ${insertDb}.bids (eventType, blockTime, blockNumber, address, trxHash, gasPrice, gasUsed, auctionID, osmPrice, lot, lotType, tab, tabType) VALUES (?, STR_TO_DATE(?, '%c/%e/%Y, %r'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, []],
		deals : [`INSERT INTO ${insertDb}.deals (eventType, blockTime, blockNumber, address, trxHash, gasPrice, gasUsed, auctionID, osmPrice) VALUES (?, STR_TO_DATE(?, '%c/%e/%Y, %r'), ?, ?, ?, ?, ?, ?, ?)`, []],
		others : [`INSERT INTO ${insertDb}.other (eventType, blockTime, blockNumber, address, trxHash, gasPrice, gasUsed, configType, value, unit) VALUES (?, STR_TO_DATE(?, '%c/%e/%Y, %r'), ?, ?, ?, ?, ?, ?, ?, ?)`, []]
	}

/* !---- 3. Go through events ----! */
     	// Iterate over events. Information that is the same for each event type is performed all together
	// The variables are ordered, so that as few calls to w3 are made as possible. THat way, the loop can be skipped if the event is not new, as soon as possible.
	for (let i = 0; i < events.length; i++) {
		let event, block, tx, txReceipt, blockTime, blockDate, time, compareTime, sqlTime, eventType, result, blockNumber, address, trxHash, gasPrice, gasUsed, auctionId, osmPrice, lot, tab, raw, lotType, tabType, configType, value, unit, sqlEvents, sqlValue;
		event = events[i]

		// 1. eventType
        	if (event.event === 'Kick') {
			eventType = 'KICK'
		} else {
			result = eventTypeArr.filter(type => type.hash === event.raw.topics[0]);
			if (result.length > 0) {
				eventType = result[0].name

			//CHECK A: If this is an event that's not part of the defined events to be logged, then skip
			} else {
				//some unrecognized event that we don't need to log
				eventLog += '\tSkipped ' + (i + 1) + ' of '+ events.length + ', for event ' + eventType + '\n\tReason - Event type unrecognized\n\n'
				continue
			}
		}

		// 2. auctionID
		if (eventType === 'KICK' || eventType === 'TEND' || eventType === 'DENT' || eventType === 'DEAL') {
			if (eventType === 'KICK') {
				auctionId = parseInt(event.returnValues.id, 10);
			} else {
				auctionId = parseInt(event.raw.topics[2],16);
			}
		}

		// CHECK B and C: Is a KICK or DEAL unique? If no, skip iteration
		if (eventType === 'KICK' || eventType === 'DEAL') {
			if (eventType === 'KICK') {
				sqlResults = await con.query(`SELECT auctionID from ${queryDb}.kicks WHERE auctionID = ?`, auctionId)
			} else if (eventType === 'DEAL') {
				sqlResults = await con.query(`SELECT auctionID from ${queryDb}.deals WHERE auctionID = ?`, auctionId)
			}
			if (sqlResults.length > 0) {
				//The auction has already been recorded. Only one kick or deal can be called per auction, so we need to skip this loop
				eventLog += '\tSkipped ' + (i + 1) + ' of '+ events.length + ', for event ' + eventType + ' and auction ' + auctionId + '\n\tReason - Kick or deal has already been recorded\n\n'
				continue
			}
		}

		// 3. lot, 4. lotType, 5. tab, 6. tabType
		if (eventType === 'KICK' || eventType === 'TEND' || eventType === 'DENT') {
			if (eventType === 'KICK') {
				// 3. lot, 4. lotType
				lot = event.returnValues.lot / 10 ** 18;

				// 5. tab, 6, tabType
				tab = event.returnValues.tab / 10 ** 27 / 10 ** 18;
			} else {
				// 3. lot, 4. lotType
				lot = parseInt(event.raw.topics[3], 16) / 10 ** 18;

				// 5. tab, 6, tabType
				raw = event.raw.data.slice(288, -248);
				tab = parseInt(raw,16) / 10 ** 27 / 10 ** 18;
			}

			lotType = 'ETH'
			tabType = 'DAI'
		}

		// 7. trxHash
		trxHash = event.transactionHash

		// CHECK D: Is a bid (TEND or DENT) unique? If no, skip iteration
		if (eventType === 'TEND' || eventType === 'DENT') {
			let string = `SELECT * from ${queryDb}.bids WHERE trxHash = ? AND auctionID = ? AND lot = ? AND tab = ?`
			let params = [trxHash, auctionId, lot.toFixed(3), tab.toFixed(3)] // need to round lot/tab, because SQL stores only to 3 decimal places.
			sqlResults = await con.query(string, params)
			if (sqlResults.length > 0) {
				// The bid has already been recorded (based on a combination of fields), so we need to skip this loop
				eventLog += '\tSkipped ' + (i + 1) + ' of '+ events.length + ', for event ' + eventType + ' and auction ' + auctionId + '\n\tReason - Bid has already been recorded\n\n'
				continue
			}
		}

		// 8. configType, 9. Value, 10. Unit
		if (eventType === 'FILE') {
			result = configArray.filter(type => type.hash === event.raw.topics[2]);
			configType = result[0].name;

			if (configType === 'BEG') {
				value = parseInt(event.raw.topics[3]) / 10 ** 18;
				value = (value - 1) * 100;
				unit = 'percent'
			} else if (configType === 'TAU') {
				value = parseInt(event.raw.topics[3]);
				value = value / 60;
				unit = 'minutes'
			} else if (configType === 'TTL') {
				value = parseInt(event.raw.topics[3]);
				value = value / 60;
				unit = 'minutes'
			}
		} else if (eventType === 'TICK' || eventType === 'DENY' || eventType === 'RELY') {
			// Add NULL values, because non-FILE events need to have the same number of parameters passed, even through they are blank
			configType = null
			value = null
			unit = null
		}

		// CHECK E: Is other event unique? If no, skip iteration
		if (eventType === 'FILE' || eventType === 'TICK' || eventType === 'DENY' || eventType === 'RELY') {
			// If query used placeholders, a null value (set above) would resolve to 'NULL' as a string, not as the NULL value of SQL. Therefore, we have
			// to manually test if value is 'NULL' and then convert the string into 'IS NULL.' We must manually create the string below, and not rely on
			// placeholders. We also need to create a new variable (sqlValue), because the original variable (value) will be inserted into SQL, and its
			//value needs to be 'NULL', so that it can properly resolve to NULL when it is added to MySQL.
			if (value == null) {
				sqlValue = 'IS NULL'
			} else
			// If the value is not null (a FILE event) then we need to round value, because SQL doesn't store to that many decimal places/
			{
				sqlValue = "= " + mysql.escape(value.toFixed(3))
			}

			let string = `SELECT * from ${queryDb}.other WHERE trxHash = '${trxHash}' AND eventType = '${eventType}' AND value ${sqlValue};`
			sqlResults = await con.query(string)
			if (sqlResults.length > 0) {
				// This event has already been recorded (based on a combination of fields), so we need to skip this loop
				eventLog += '\tSkipped ' + (i + 1) + ' of '+ events.length + ', for event ' + eventType + '\n\tReason - Other event has already been recorded\n\n'
				continue
			}
		}

		// 11. blockNumber
		blockNumber = event.blockNumber

		// 12. Time - this is the block time (is the same for every transaction within that block)
		block = await w3.eth.getBlock(event.blockNumber)
		blockTime = block.timestamp;
		blockDate = new Date(blockTime * 1000);
		time = blockDate.toLocaleString('en-US', {timeZone: 'America/New_York'})

		// 13. address, 14. gasPrice
		tx = await w3.eth.getTransaction(event.transactionHash)
		address = tx.from
		gasPrice = tx.gasPrice

		// 15. gasUsed
		txReceipt = await w3.eth.getTransactionReceipt(event.transactionHash)
		gasUsed = txReceipt.gasUsed

		// 16. osmPrice
		if (eventType === 'KICK' || eventType === 'TEND' || eventType === 'DENT' || eventType === 'DEAL') {
			let results = await getOsmEvents(event.blockNumber, osmContract)
			let logEvent = results[results.length - 1]

			if (logEvent) {
				let priceInWei = w3.utils.toBN(logEvent.returnValues[0]);
				osmPrice = w3.utils.fromWei(priceInWei);
			} else { osmPrice = 0 }
		}

		// Add sqlString to appropriate sql
		if (eventType === 'KICK') {
			sqlArr.kicks[1].push([eventType, time, blockNumber, address, trxHash, gasPrice, gasUsed, auctionId, osmPrice, lot, lotType, tab, tabType])
		} else if (eventType === 'TEND' || eventType === 'DENT') {
			sqlArr.bids[1].push([eventType, time, blockNumber, address, trxHash, gasPrice, gasUsed, auctionId, osmPrice, lot, lotType, tab, tabType])
		} else if (eventType === 'DEAL') {
			sqlArr.deals[1].push([eventType, time, blockNumber, address, trxHash, gasPrice, gasUsed, auctionId, osmPrice])
		} else {
			sqlArr.others[1].push([eventType, time, blockNumber, address, trxHash, gasPrice, gasUsed, configType, value, unit])
		}
	}

	// Loop through final SQL statements, and perform final functions
	for (let key in sqlArr) {
		sqlLog += key + ':\n'
		// If array is empty, then it will automatically be excluded from this array
		for (let i = 0; i < sqlArr[key][1].length; i++) {
			// 1. Append query to a string, to write to a file
			let string = mysql.format(sqlArr[key][0], sqlArr[key][1][i])
			sqlLog += string + '\n\n'
			// 2. Execute query
			con.query(string)
		}
		// 3. At end of that event type, log that events have been recorded
		console.log(key + ' events recorded to database\n')
	}

	// 4. Log events
	console.log('skips:\n' + eventLog)
	// 5. Log final SQL
	console.log(sqlLog)

}
