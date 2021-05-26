# bot
## abi
This folder contains the ABIs for the following projects:

| Maker (*daiAbi.js*) | Uniswap (*uniAbi.js*) | Chainlink (*linkAbi.js*) | ERC-20 Tokens (*tokenAbi.js*) |
| ------              | -------------         | -------------            | -------------                 |
| flipper             | router02              | v2Contract               | weth                          |
| osm                 | factory               | v1Contract               | dai                           |
| cat                 | pairV2                |                          |                               |
| vat                 | pairV1                |                          |                               |
| ethJoin             |                       |                          |                               |
| medianEthUsd        |                       |                          |                               |
| daiJoin             |                       |                          |                               |

## addr
*ethAddr.js* contains relevant addresses used by the liquidation bot. The addresses are listed below. 
| Maker         | ERC-20 tokens | Uniswap       | Personal | Chainlink  |
| ------        | ------------- | -------       | -------- | --------   |
| ethFlip       | dai           | factory       | parity   | ethUsd*    |
| osm           | weth          | router02      | mm       | ethUsdOld* |
| cat           | usdc          | ethDaiPairV1* |          | daiUsd*    |
| vat           | tusd          | ethDaiPairV2* |          | ethDai*    |
| ethJoin       | bat           |               |          |            |
| medianEthUsd* | wbtc          |               |          |            |
| daiJoin       |               |               |          |            |

Addresses listed with an asterisk (\*) are only recorded for the main network, usually because the addresses are not applicable for the Kovan network.

## cron
This folder contains the files run by the system on a periodic basis. The system configuration was set by calling `crontab -e` on Ubuntu (see **Non-repository code** section for further details).

The two major processes are as follows:
#### Update auctions
*upAuctions.sh* is called each day. This executable file calls *upEvents.js* and *upCities.js* (both in the `listener` module). *upEvents.js* updates the SQL database for auction events, while *upCities.js* updates the SQL address for city-address mappings. 

The executable file calls *upEvents.js* and *upCities.js* to update on both the main and kovan networks. All output is run through *timestamp.sh*, and then logged to *upAuctions.log*. 
#### Update Maker contracts
Each day, the files *poke.sh* (to update the Maker OSM price) and *drip.sh* (to update the debt owed by each Maker vault) are called. All output is run through *timestamp.sh*, and then logged to *upMakerContracts.log*.

Both *poke.sh* and *drip.sh* rely on the `seth` utility. See the **Non-repository code** section for further details on the `seth` configuration.
## dashboard
This folder contains an Excel file, which displays a dashboard with information from a SQL database. The database is hosted on an AWS server (see **Non-repository code** section for further details), and is updated through the `listener` module. The Excel file contains several VBA modules that automate interactions with the dashboard.
## exec
This folder contains the three modules that execute the primary functions of the liquidation bot.
#### bidder
The liquidation bot is started by calling `start-flip-eth` on the command line of the Linux virtual machine. This command is an alias, as defined in `~/.bashrc`. `start-flip-eth` calls *flip-eth-a.sh*, which defines the parameters for starting the auction-keeper module. The parameters for *flip-eth-a.sh* include:
- The bidding model to be used, which is *model-beta.js*. 
- Environmental variables, as defined in *environment.sh*.
- Variables for gas fees, as defined in *dynamic_gas.sh*.

*model-beta.js* reads messages sent by the auction-keeper module, and decides on a bidding price by calling the `getBestTrade` function in *uniTradeLib.js* (in the `trader` module). All output from the model is written to *auction-keeper-flip-ETH-A.log*.
#### listener
As mentioned in the ***cron*** section, *upAuctions.sh* calls two files in this folder:
- *upCities.js* queries the SQL database for new addresses, and associates these addresses to random city names, if they have not yet been assigned a name.
- *upEvents.js* uses the library in *eventLib.js* to update the SQL database for all new auction events.

Both files are configured to check either the mainnet and Kovan network.

The primary execution function in *eventLib.js* is `showEvents`, which queries all auction events (since the most recent event in the SQL database), and executes an update query in SQL, if needed.
#### trader
*uniTradeLib.js* is the central file used in the `trader` module. It is called in two separate instances:
1. **Bidding**: The auction-keeper sends new auction events to *model-beta.js* (in the `bidder` module), which calls the `getBestTrade` function in *uniTradeLib.js*. This function determines the appropriate bidding threshold, which thereby determines the maximum price to bid at for each auction.
2. **Rebalancing portfolio**: Each time the auction-keeper searches for new auctions, it first calls *tradeTokens.js*. This file checks whether DAI is below the minimum target. If it is, it performs two actions:
    - Exits WETH from the Vat.
    - Trades WETH to DAI, in an amount sufficient to ensure the minimum DAI target is met. The trade is executed using the `tradeTokens` function in *uniTradeLib.js*.

*uniTradeLib.js* uses the *uniHelperLib.js* file to submit transactions to Uniswap.
## sqlData
This folder contains the data exports from the AWS MySQL database used to store blockchain information (exported using MariaDB version of mysqldump). The following databases were exported:
- *main*: Auction events from the main Ethereum network
- *kovan*: Auction events from the Kovan network
- *other*: Non-auction data. Includes city names, contracts for Link, and contracts for Uniswap
- *test*: Data copied from the *main* database, and used for testing purposes only

For further information on the SQL database, see the **Non-repository code** section below.

## utils
This folder contains libraries that are not used during the execution of the liquidation bot, but are included for reference:
1. *chainLinkLib.js*: Retrieves historical price data from ChainLink oracle contracts
2. *etherScanLib.js*: Used by *uniswapLib.js* to get information on all Uniswap pairs.
3. *graphLib.js*: Query price results from the Uniswap subgraph on TheGraph.com, and insert to SQL database
4. *makerLib.js*: Retrieves historical price data from Maker's DAI-ETH Median contract
5. *sqlLib.js*: Updates the price data for each event recorded in SQL, based on the historical price data for Uniswap and Chainlink already recorded in SQL database
6. *uniswapLib.js*: A) Uses *etherScanLib.js* to aggregate information on all Uniswap pairs, either on the mainnet or Kovan network. B) Queries price results from the ETH-DAI Uniswap V2 contract, and inserts to SQL database
7. *wethLib.js*: Wraps and unwraps WETH.

## Non-repository code
- System
  - This code was tested on a Linux virtual machine, running Ubuntu 18.04.4 (GNU/Linux 4.15.0-106-generic x86_64). The machine had 500GB of storage and 16GB of RAM.
- parity
  - OpenEthereum 3.0.0 (referred to as "parity" for brevity) was used during testing. The configuration file was generated using the [Parity Config Generator](https://paritytech.github.io/parity-config-generator/), and loaded to `~/.local/share/io.parity.ethereum/config.toml`. The code added to `config.toml` is reproduced below.
    ```
    [parity]
    # Kovan Test Network
    chain = "kovan"
    [account]
    # From: [0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3] you'll be able to send transactions without password.
    unlock = ["0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3"]
    # File at ~/tempest/password-flip-a.txt should contain passwords to unlock your accounts. One password per line.
    password = ["/home/eth/tempest/password-flip-a.txt"]
    [footprint]
    # Will keep up to 12288MB data in Database cache.
    cache_size_db = 12288
    ```
- Hidden files
  - Certain files were excluded from the repository, using a configured `.gitignore` file. The excluded files are as follows:
    - `secrets.js`: This file was used to store keystore/password information for all accounts used by this repository.
    - `password-parity.txt`: A separate text file for the parity account was needed, as the auction-keeper repository required a separate file to access the parity password
    - `.gitignore`: The configuration file itself was also excluded.
- crontab
  - As mentioned in the ***cron*** section, the command `crontab -e` was used to configure certain files to run at periodic intervals. The code added to `crontab` is reproduced below.
    ```
    0 0 * * * /home/eth/tempest/maker/cron/poke.sh 2>&1 | /home/eth/tempest/maker/cron/timestamp.sh >> /home/eth/tempest/maker/cron/upMakerContracts.log
    1 0 * * * /home/eth/tempest/maker/cron/drip.sh 2>&1 | /home/eth/tempest/maker/cron/timestamp.sh >> /home/eth/tempest/maker/cron/upMakerContracts.log
    daily /home/eth/tempest/maker/cron/upAuctions.sh 2>&1 | /home/eth/tempest/maker/cron/timestamp.sh >> /home/eth/tempest/maker/cron/upAuctions.log
    ```
- auction-keeper
  - The [auction-keeper](https://github.com/makerdao/auction-keeper) repository is used to monitor and bid on auctions. The primary logic for the auction-keeper comes through `main.py`. The `main.py` file was customized, in order to automate the conversion of WETH to DAI. The code added to the files is reproduced below.
    - Line 24 of `main.py`
      ```
      from subprocess import call
      ```
    - Line 470 of `main.py`
      ```
      # 1. Call a NodeJS file, to exit WETH and convert to DAI, if needed
      self.logger.info(f"Checking if WETH needs to be converted to DAI and added to Vat")
      call(["node", "/home/eth/tempest/maker/exec/trader/tradeTokens.js"])
      # 2. Add more DAI, so that more bids can be made
      self.rebalance_dai()
      ```
- seth
  - The [seth](https://github.com/dapphub/dapptools/tree/master/src/seth) repository is used to make simple queries to the blockchain. The configuration file is located at `~/.sethrc`, and the configuration code is reproduced below:
    ```
    export SETH_CHAIN=kovan
    export ETH_RPC_URL=http://localhost:8545
    # Set an address as the default sender (Parity account)
    export ETH_FROM=0xd536eA64B9865059fc5e2D8BFd9Aa9bF677722f3
    #ETH ilk - signature (bytes32)
    export ETH_ILK=0x4554482d41000000000000000000000000000000000000000000000000000000
    #KOVAN accounts - change to mainnet if/when needed
    export PIP_ETH=0x75dD74e8afE8110C8320eD397CcCff3B8134d981
    export MCD_JUG=0xcbB7718c9F39d05aEEDE1c472ca8Bf804b2f1EaD
    ```
- MySQL (AWS)
  - The `listener` module continually updates a SQL database with new auction events. The SQL database was set up on an AWS MySQL server, using the basic free tier. The server was configured to only accept connections from 1) The specific IP address used by the Linux virtual machine, and 2) The IP range used by the home computer of the repository author. The SQL database was closed on November 3, 2020, and the data was exported to this repository (see the ***sqlData*** section).
- bashrc
  - Two aliases were added to the `~/.bashrc` file, which are relevant to this project. The alias code is reproduced below:
    ```
    # Access parity
    alias parity=~/openethereum/target/release/openethereum
    # start bidding model
    alias start-flip-eth='. /home/eth/tempest/maker/exec/bidder/flip-eth-a.sh /home/eth/tempest/maker/exec/bidder/model-beta.js | tee -a -i /home/eth/tempest/maker/exec/bidder/auction-keeper-flip-ETH-A.log'
    ```
- web3 and Ethers.js
  - The `listener` module uses the [web3.js](https://github.com/ethereum/web3.js/) repository for interacting with Ethereum.
  - The `bidder`, `trader`, and `utils` modules (which were developed after the `listener` module) use the [ethers.js](https://github.com/ethers-io/ethers.js) repository for interacting with Ethereum.
  - Going forward, all development will use ethers.js to interact with Ethereum.
