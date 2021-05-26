# @file Used by flip-eth-a.sh to set gas parameters for the auction-keeper

# @function Echoes an appropriate gas price, based on the GAS_MODE selected, as well as the GAS_MULTIPLIER set (both in environment.sh)
# @param {void}
# @output {string} Gas price, based on the GAS_MODE selected, as well as the GAS_MULTIPLIER that was set
# @return {void}
dynamic_gas()
{
  SCALE_GWEI=1000000000
  ETHGASSTATION_URL=https://ethgasstation.info/json/ethgasAPI.json?api-key=$ETHGASSTATION_API_KEY
  ETHERCHAIN_URL=https://www.etherchain.org/api/gasPriceOracle

  if [[ $GAS_MODE = 1 ]]; then
    res=$(curl -s -X GET \
      -H "accept: application/json" \
      "$ETHGASSTATION_URL" \
      | jq '.fastest' \
    )
    gas=$(bc <<< "(${res}/10) * ${SCALE_GWEI}")
  elif [[ $GAS_MODE = 2 ]]; then
    res=$(curl -s -X GET \
      -H "accept: application/json" \
      "$ETHERCHAIN_URL" \
      | jq '.fastest' \
      | bc -l
    )
    gas=$(bc <<< "${res} * ${SCALE_GWEI}")
  elif [[ $GAS_MODE = 3 ]]; then
    res=$(curl -s -X GET \
      -H "accept: application/json" \
      "${POANETWORK_URL:-https://gasprice.poa.network}" \
      | jq '.instant' \
      | bc -l
    )
    gas=$(bc <<< "${res} * ${SCALE_GWEI}")
  else
    res=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_gasPrice\",\"params\":[],\"id\":${RANDOM}}" \
      ${SERVER_ETH_RPC_HOST} \
      | jq -r '.result' \
      | sed 's/0x//' \
    )
    gas=$(bc <<<"ibase=16; $(tr a-f A-F <<<"${res}")")
  fi

  echo $(bc -l <<< "scale=0; (${gas} * $GASPRICE_MULTIPLIER)/1")
}

# @function Echoes the type of gas API to use, based on the GAS_MODE set in environment.sh
# @param {void}
# @output {string} Option name, based on the source type set in GAS_MODE# @return {void}
dynamic_gas_params()
{
  if [[ $GAS_MODE = 1 ]]; then
    echo "--ethgasstation-api-key ${ETHGASSTATION_API_KEY}"
  elif [[ $GAS_MODE = 2 ]]; then
    echo "--etherchain-gas-price"
  elif [[ $GAS_MODE = 3 ]]; then
    echo "--poanetwork-gas-price --poanetwork-url ${POANETWORK_URL:-https://gasprice.poa.network}"
  fi
}
