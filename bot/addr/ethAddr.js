/**
 * @file Records addresses for accounts/contracts relevant to the liquidation bot, for both kovan and main networks
 */

kovan = {
	// Uniswap
	factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
	router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
	// ethDaiPairV1 and ethDaiPairV2 are not included, because price detail isn't needed on Kovan network

	// Maker
	ethFlip: '0xB40139Ea36D35d0C9F6a2e62601B616F1FfbBD1b', // MCD_FLIP_ETH_A on Maker contract list (https://changelog.makerdao.com/releases/kovan/1.0.7)
	osm: '0x75dD74e8afE8110C8320eD397CcCff3B8134d981', // PIP_ETH
	cat: '0x0511674A67192FE51e86fE55Ed660eB4f995BDd6', // MCD_CAT
	vat: '0xbA987bDB501d131f766fEe8180Da5d81b34b69d9', // MCD_VAT
	ethJoin: '0x775787933e92b709f2a3C70aa87999696e74A9F8', // MCD_JOIN_ETH_A
	medianEthUsd: '', // Not included, because price detail isn't needed on Kovan network
	daiJoin: '0x5AA71a3ae1C0bd6ac27A1f28e1415fFFB6F15B8c', // MCD_JOIN_DAI

	// ERC-20 tokens
	dai: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa', // MCD_DAI 
	weth: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
	usdc: '0xe22da380ee6B445bb8273C81944ADEB6E8450422', // Listed as address on Aave Kovan (https://docs.aave.com/developers/deployed-contracts/deployed-contract-instances)
	tusd: '0x1c4a937d171752e1313D70fb16Ae2ea02f86303e', // Listed as address on Aave Kovan
	bat: '0x2d12186Fbb9f9a8C28B3FfdD4c42920f8539D738', // Listed as address on Aave Kovan
	wbtc: '0x3b92f58feD223E2cB1bCe4c286BD97e42f2A12EA', // Listed as address on Aave Kovan

	// ChainLink
	// N/A, because prices aren't recorded on the Kovan network

	// Personal
	parity:'0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3',
	mm:'0x50F721484Ddb4778998F7fb72E59bfbA143c3704',
}

main = {
	// Uniswap
	factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
	router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
	ethDaiPairV1: '0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667',
	ethDaiPairV2: '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11',

	// Maker
	ethFlip: '0xd8a04F5412223F513DC55F839574430f5EC15531', // MCD_FLIP_ETH_A
	osm: '0x81FE72B5A8d1A857d176C3E7d5Bd2679A9B85763', // PIP_ETH
	cat: '0x78F2c2AF65126834c51822F56Be0d7469D7A523E', // MCD_CAT
	vat: '0x35D1b3F3D7966A1DFe207aa4514C12a259A0492B', // MCD_VAT
	ethJoin: '0x2F0b23f53734252Bda2277357e97e1517d6B042A', // MCD_JOIN_ETH_A
	medianEthUsd: '0x64DE91F5A373Cd4c28de3600cB34C7C6cE410C85', // Median ETH-USD oracle
	daiJoin: '0x9759A6Ac90977b93B58547b4A71c78317f391A28', // MCD_JOIN_DAI

	// ERC-20 tokens
	dai: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // MCD_DAI on Maker contract list (https://changelog.makerdao.com/releases/mainnet/1.0.7/)
	weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
	tusd: '0x0000000000085d4780B73119b644AE5ecd22b376',
	bat: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
	wbtc: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',

	// ChainLink
	ethUsd: '0xF79D6aFBb6dA890132F9D7c355e3015f15F3406F',
	ethUsdOld: '0x79fEbF6B9F76853EDBcBc913e6aAE8232cFB9De9',
	daiUsd: '0xa7D38FBD325a6467894A13EeFD977aFE558bC1f0',
	ethDai: '0x037E8F2125bF532F3e228991e051c8A7253B642c',

	// Personal
	parity:'0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3',
	mm:'0x50F721484Ddb4778998F7fb72E59bfbA143c3704',
}

module.exports = {
	kovan,
	main
}
