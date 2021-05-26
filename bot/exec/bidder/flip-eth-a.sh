# @file Starts the auction-keeper process, with paramaters imported from environment.sh and dynamic_gas.sh

#!/bin/bash
. "${BASH_SOURCE%/*}/environment.sh" # Set the RPC host, account address, keys, and everything else
. "${BASH_SOURCE%/*}/dynamic_gas.sh" # Set the gas strategy

. ${FULL_PATH_TO_KEEPER_DIRECTORY}/_virtualenv/bin/activate # Run virtual environment

# Allows keepers to bid different prices
MODEL=$1

${FULL_PATH_TO_KEEPER_DIRECTORY}/bin/auction-keeper \
	--rpc-host ${SERVER_ETH_RPC_HOST:?} \
	--rpc-timeout 300 \
	--eth-from ${FLIP_ETH_A_ACCOUNT_ADDRESS?:} \
	--eth-key ${FLIP_ETH_A_ACCOUNT_KEY?:} \
	--type flip \
	--max-auctions 100 \
	$(dynamic_gas_params) \
	--vat-dai-target ${FLIP_ETH_A_DAI_IN_VAT} \
	--from-block ${FIRST_BLOCK_TO_CHECK} \
	--ilk ${FLIP_ILK_ETH_A} \
	--min-auction ${FLIP_MINIMUM_ETH_A_AUCTION_ID_TO_CHECK} \
	--model ${MODEL} \
	--keep-dai-in-vat-on-exit \
	--bid-only
