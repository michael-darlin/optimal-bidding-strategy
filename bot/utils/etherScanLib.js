// 1. Libraries
const axios = require('axios')
const secrets = require('../../secrets.js')

// 2. Variables
// Milliseconds to wait, if request limit has been reached
const sleepIncrement = 150

/**
 * Find the name of an ERC-20 token (e.g. DAI, USDC, etc.) from the Etherscan API
 * @param  {String} address - Address of ERC-20 contract to query
 * @param  {String} [chain="kovan"] - Name of chain to connect to (main or kovan)
 * @param  {Number} [sleepTime=0] - Initial time to wait before making another call (with an additional increment from sleepIncrement)
 * @return {Array|Array} If the HTTP call returns an error message, other than "Max rate limit reached", an array will be returned with two items: 1) the contract address, and 2) an "n/a" value for the token name. If an HTTP call returns the error message "Max rate limit," the function will be called again in a recursive loop. When the function no longer returns an error message, an array will be returned with two values: 1) the contract address, and 2) the token name.
 */
async function getTokenName(address,chain='kovan', sleepTime=0) {
	if (chain === 'kovan') {
		var domain = 'api-kovan'
	} else {
		var domain = 'api'
	}

	const url = 'https://' + domain + '.etherscan.io/api?module=account&action=tokentx&contractaddress=' + address + '&page=1&offset=1&apikey=' + secrets.apiKey

	let result = await axios.get(url)

	// Error check
 	if ( result.data.message !== 'OK' ) {
		// If we made too many calls, then wait a specific time and call again
		if (result.data.result == 'Max rate limit reached') {
			await sleep(sleepTime + sleepIncrement)
			// This result sets up a recursive function.
			// The sleepTime parameter is initially set to 0, but each iteration the parameters is incremented by sleepIncrement (e.g. from 0 to 150, 150 to 300, 300 to 450, etc.)
			return getTokenName(address, sleepTime + sleepIncrement)
		// A different error probably means the address was not a token
		} else {
			return [address, 'n/a']
		}
	} else {
		return [address, result.data.result[0].tokenSymbol]
	}
}

/**
 * Get the total supply of an ERC-20 token
 * @param  {String} address - Address of ERC-20 contract to query
 * @param  {String} [chain="kovan"] - Name of chain to connect to (main or kovan)
 * @param  {Number} [sleepTime=0] - Initial time to wait before making another call (with an additional increment from sleepIncrement)
 * @return {String|String} If the HTTP call returns an error message, other than "Max rate limit reached", the value "n/a" will be returned. If an HTTP call returns the error message "Max rate limit," the function will be called again in a recursive loop. When the function no longer returns an error message, a string with the value of the token supply will be returned.
 */
async function getTokenSupply(address, chain='kovan', sleepTime=0) {
	if (chain === 'kovan') {
		var domain = 'api-kovan'
	} else {
		var domain = 'api'
	}

	const url = 'https://' + domain + '.etherscan.io/api?module=stats&action=tokensupply&contractaddress=' + address + '&apikey=' + secrets.apiKey

	let result = await axios.get(url)

	// Error check
 	if ( result.data.message !== 'OK' ) {
		if (result.data.result == 'Max rate limit reached') {
			//If we made too many calls, then wait a specific (incrementing) time and call again
			await sleep(sleepTime + sleepIncrement)
			return getTokenSupply(address, sleepTime + sleepIncrement)
		//A different error should just return "n/a"
		} else {
			return 'n/a'
		}
	} else {
		return result.data.result
	}
}

// OUTDATED: Would need etherscan-api to be required as "api." etherscan-api library not used, because it doesn't support kovan testnet
/**
 * Get the balance of a specific account
 * @param  {void}
 * @output Balance of the specific account queried
 * @return {void}
 */
async function getBalance() {
	// Address is for Metamask account
	const resp = await api.account.balance('0x50F721484Ddb4778998F7fb72E59bfbA143c3704')

	// Uppercase name for chain, for output
	chain = chain.charAt(0).toUpperCase() + chain.slice(1)

	// Result must be converted from gwei to ether
	console.log(chain + ' balance of MetaMask account is: ' + resp.result / 10 ** 18)
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

module.exports = {
	getTokenName,
	getBalance,
	sleep,
	getTokenSupply
}
