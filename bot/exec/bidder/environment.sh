# @file Sets the environmental variables that will be used by the auction-keeper

# host and port
SERVER_ETH_RPC_HOST=http://localhost:8545

# Dynamic Gas Price Model
# 0 = get the gas price from the node (default)
# 1 = get the gas price from ethgasstation.info
#     must set ETHGASSTATION_API_KEY
# 2 = get the gas price from etherchain.org
# 3 = get the gas price from poanetwork
#     set POANETWORK_URL env var to point to a self hosted server e.g. POANETWORK_URL=http://localhost:8000
GAS_MODE=0
# increase this if you want to use higher price than the one reported
# (e.g. if 2.0 then will use 2 * fast)
GASPRICE_MULTIPLIER=2
# ETHGASSTATION_API_KEY is optional.  If you fill it in the model will use
# ethgasstation.info for dynamic gas, otherwise we will simply check the node.
#ETHGASSTATION_API_KEY=MY_ETH_GASSTATION_KEY
FULL_PATH_TO_KEEPER_DIRECTORY=/home/eth/auction-keeper
FIRST_BLOCK_TO_CHECK=14764534 #For Kovan
DAI_IN_VAT=200

###### FLIP-ETH-A Config ######
FLIP_ETH_A_ACCOUNT_ADDRESS='0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3'
FLIP_ETH_A_ACCOUNT_KEY='key_file=/home/eth/.local/share/io.parity.ethereum/keys/kovan/keystore-flip-a.json,pass_file=/home/eth/tempest/password-parity.txt'
FLIP_ETH_A_DAI_IN_VAT=${DAI_IN_VAT}
FLIP_ILK_ETH_A=ETH-A
FLIP_MINIMUM_ETH_A_AUCTION_ID_TO_CHECK=2000 # Currently set for Kovan. 4914 for mainnet
FLIP_ETH_URL="https://api.coingecko.com/api/v3/simple/price?ids=ethereum,dai&vs_currencies=usd"
FLIP_ETH_DISCOUNT=0.75 # e.g. 0.25 = 25% discount from FMV

###### FLIP-BAT-A Config ######
FLIP_BAT_A_ACCOUNT_ADDRESS='0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3'
FLIP_BAT_A_ACCOUNT_KEY='key_file=/home/eth/.local/share/io.parity.ethereum/keys/kovan/keystore-flip-a.json,pass_file=/home/eth/tempest/password-parity.txt'
FLIP_BAT_A_DAI_IN_VAT=${DAI_IN_VAT}
FLIP_ILK_BAT_A=BAT-A
FLIP_MINIMUM_BAT_A_AUCTION_ID_TO_CHECK=471
FLIP_BAT_URL="https://api.coingecko.com/api/v3/simple/price?ids=basic-attention-token&vs_currencies=usd"
FLIP_BAT_DISCOUNT=0.25 # e.g. 0.25 = 25% discount from FMV

###### FLIP-USDC-A Config ######
FLIP_USDC_A_ACCOUNT_ADDRESS='0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3'
FLIP_USDC_A_ACCOUNT_KEY='key_file=/home/eth/.local/share/io.parity.ethereum/keys/kovan/keystore-flip-a.json,pass_file=/home/eth/tempest/password-parity.txt'
FLIP_USDC_A_DAI_IN_VAT=${DAI_IN_VAT}
FLIP_ILK_USDC_A=USDC-A
FLIP_MINIMUM_USDC_A_AUCTION_ID_TO_CHECK=0
FLIP_USDC_URL="https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd"
FLIP_USDC_DISCOUNT=0.25 # e.g. 0.25 = 25% discount from FMV

###### FLIP-USDC-B Config ######
FLIP_USDC_B_ACCOUNT_ADDRESS='0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3'
FLIP_USDC_B_ACCOUNT_KEY='key_file=/home/eth/.local/share/io.parity.ethereum/keys/kovan/keystore-flip-a.json,pass_file=/home/eth/tempest/password-parity.txt'
FLIP_USDC_B_DAI_IN_VAT=${DAI_IN_VAT}
FLIP_ILK_USDC_B=USDC-B
FLIP_MINIMUM_USDC_B_AUCTION_ID_TO_CHECK=0
FLIP_USDC_URL="https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=usd"
FLIP_USDC_DISCOUNT=0.25 # e.g. 0.25 = 25% discount from FMV

###### FLIP-WBTC-A Config ######
FLIP_WBTC_A_ACCOUNT_ADDRESS='0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3'
FLIP_WBTC_A_ACCOUNT_KEY='key_file=/home/eth/.local/share/io.parity.ethereum/keys/kovan/keystore-flip-a.json,pass_file=/home/eth/tempest/password-parity.txt'
FLIP_WBTC_A_DAI_IN_VAT=${DAI_IN_VAT}
FLIP_ILK_WBTC_A=WBTC-A
FLIP_MINIMUM_WBTC_A_AUCTION_ID_TO_CHECK=2
FLIP_WBTC_URL="https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
FLIP_WBTC_DISCOUNT=0.25 # e.g. 0.25 = 25% discount from FMV

###### FLIP-TUSD-A Config ######
FLIP_TUSD_A_ACCOUNT_ADDRESS='0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3'
FLIP_TUSD_A_ACCOUNT_KEY='key_file=/home/eth/.local/share/io.parity.ethereum/keys/kovan/keystore-flip-a.json,pass_file=/home/eth/tempest/password-parity.txt'
FLIP_TUSD_A_DAI_IN_VAT=${DAI_IN_VAT}
FLIP_ILK_TUSD_A=TUSD-A
FLIP_MINIMUM_TUSD_A_AUCTION_ID_TO_CHECK=0
FLIP_TUSD_URL="https://api.coingecko.com/api/v3/simple/price?ids=true-usd&vs_currencies=usd"
FLIP_TUSD_DISCOUNT=0.25 # e.g. 0.25 = 25% discount from FMV

###### FLOP Config ######
FLOP_ACCOUNT_ADDRESS='0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3'
FLOP_ACCOUNT_KEY='key_file=/home/eth/.local/share/io.parity.ethereum/keys/kovan/keystore-flip-a.json,pass_file=/home/eth/tempest/password-parity.txt'
FLOP_DAI_IN_VAT=${DAI_IN_VAT}
FLOP_MKR_URL="https://api.coingecko.com/api/v3/simple/price?ids=maker&vs_currencies=usd"
FLOP_MKR_DISCOUNT=0.25 # e.g. 0.25 = 25% discount from FMV
