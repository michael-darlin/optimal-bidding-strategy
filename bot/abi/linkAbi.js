/**
 * @file Records the ABI for contracts associated to the MakerDAO project
 */

// Summary: Oracle for currency pairs, version 2 (current)
// Contract name: Aggregator
// Main addresses: 
//      0xF79D6aFBb6dA890132F9D7c355e3015f15F3406F      ETH-USD
//      0xa7D38FBD325a6467894A13EeFD977aFE558bC1f0      DAI-USD
//      0x037E8F2125bF532F3e228991e051c8A7253B642c      ETH-DAI
// Kovan adddress: n/a (not needed)
const v2Contract = [{
    "constant": false,
    "inputs": [{
        "name": "_requestId",
        "type": "bytes32"
    }, {
        "name": "_payment",
        "type": "uint256"
    }, {
        "name": "_expiration",
        "type": "uint256"
    }],
    "name": "cancelRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "address"
    }],
    "name": "authorizedRequesters",
    "outputs": [{
        "name": "",
        "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "uint256"
    }],
    "name": "jobIds",
    "outputs": [{
        "name": "",
        "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "latestAnswer",
    "outputs": [{
        "name": "",
        "type": "int256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "minimumResponses",
    "outputs": [{
        "name": "",
        "type": "uint128"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "uint256"
    }],
    "name": "oracles",
    "outputs": [{
        "name": "",
        "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_recipient",
        "type": "address"
    }, {
        "name": "_amount",
        "type": "uint256"
    }],
    "name": "transferLINK",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "latestRound",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_clRequestId",
        "type": "bytes32"
    }, {
        "name": "_response",
        "type": "int256"
    }],
    "name": "chainlinkCallback",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_paymentAmount",
        "type": "uint128"
    }, {
        "name": "_minimumResponses",
        "type": "uint128"
    }, {
        "name": "_oracles",
        "type": "address[]"
    }, {
        "name": "_jobIds",
        "type": "bytes32[]"
    }],
    "name": "updateRequestDetails",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "latestTimestamp",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "destroy",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{
        "name": "",
        "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "_roundId",
        "type": "uint256"
    }],
    "name": "getAnswer",
    "outputs": [{
        "name": "",
        "type": "int256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "_roundId",
        "type": "uint256"
    }],
    "name": "getTimestamp",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "paymentAmount",
    "outputs": [{
        "name": "",
        "type": "uint128"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "requestRateUpdate",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_requester",
        "type": "address"
    }, {
        "name": "_allowed",
        "type": "bool"
    }],
    "name": "setAuthorization",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_newOwner",
        "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "inputs": [{
        "name": "_link",
        "type": "address"
    }, {
        "name": "_paymentAmount",
        "type": "uint128"
    }, {
        "name": "_minimumResponses",
        "type": "uint128"
    }, {
        "name": "_oracles",
        "type": "address[]"
    }, {
        "name": "_jobIds",
        "type": "bytes32[]"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "response",
        "type": "int256"
    }, {
        "indexed": true,
        "name": "answerId",
        "type": "uint256"
    }, {
        "indexed": true,
        "name": "sender",
        "type": "address"
    }],
    "name": "ResponseReceived",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
    }],
    "name": "OwnershipRenounced",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
    }, {
        "indexed": true,
        "name": "newOwner",
        "type": "address"
    }],
    "name": "OwnershipTransferred",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "id",
        "type": "bytes32"
    }],
    "name": "ChainlinkRequested",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "id",
        "type": "bytes32"
    }],
    "name": "ChainlinkFulfilled",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "id",
        "type": "bytes32"
    }],
    "name": "ChainlinkCancelled",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "current",
        "type": "int256"
    }, {
        "indexed": true,
        "name": "roundId",
        "type": "uint256"
    }, {
        "indexed": false,
        "name": "timestamp",
        "type": "uint256"
    }],
    "name": "AnswerUpdated",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "roundId",
        "type": "uint256"
    }, {
        "indexed": true,
        "name": "startedBy",
        "type": "address"
    }],
    "name": "NewRound",
    "type": "event"
}]

// Summary: Oracle for currency pairs, version 1 (no longer in use)
// Contract name: Aggregator
// Main address: 
// 0x79fEbF6B9F76853EDBcBc913e6aAE8232cFB9De9       ETH-USD
// Kovan adddress: n/a (not needed)
const v1Contract = [{
    "constant": false,
    "inputs": [{
        "name": "_requestId",
        "type": "bytes32"
    }, {
        "name": "_payment",
        "type": "uint256"
    }, {
        "name": "_expiration",
        "type": "uint256"
    }],
    "name": "cancelRequest",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "address"
    }],
    "name": "authorizedRequesters",
    "outputs": [{
        "name": "",
        "type": "bool"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "uint256"
    }],
    "name": "jobIds",
    "outputs": [{
        "name": "",
        "type": "bytes32"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "minimumResponses",
    "outputs": [{
        "name": "",
        "type": "uint128"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [{
        "name": "",
        "type": "uint256"
    }],
    "name": "oracles",
    "outputs": [{
        "name": "",
        "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_recipient",
        "type": "address"
    }, {
        "name": "_amount",
        "type": "uint256"
    }],
    "name": "transferLINK",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "latestCompletedAnswer",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_clRequestId",
        "type": "bytes32"
    }, {
        "name": "_response",
        "type": "int256"
    }],
    "name": "chainlinkCallback",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_paymentAmount",
        "type": "uint128"
    }, {
        "name": "_minimumResponses",
        "type": "uint128"
    }, {
        "name": "_oracles",
        "type": "address[]"
    }, {
        "name": "_jobIds",
        "type": "bytes32[]"
    }],
    "name": "updateRequestDetails",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "currentAnswer",
    "outputs": [{
        "name": "",
        "type": "int256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "destroy",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [{
        "name": "",
        "type": "address"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "paymentAmount",
    "outputs": [{
        "name": "",
        "type": "uint128"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "constant": false,
    "inputs": [],
    "name": "requestRateUpdate",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_requester",
        "type": "address"
    }, {
        "name": "_allowed",
        "type": "bool"
    }],
    "name": "setAuthorization",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": false,
    "inputs": [{
        "name": "_newOwner",
        "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
}, {
    "constant": true,
    "inputs": [],
    "name": "updatedHeight",
    "outputs": [{
        "name": "",
        "type": "uint256"
    }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
}, {
    "inputs": [{
        "name": "_link",
        "type": "address"
    }, {
        "name": "_paymentAmount",
        "type": "uint128"
    }, {
        "name": "_minimumResponses",
        "type": "uint128"
    }, {
        "name": "_oracles",
        "type": "address[]"
    }, {
        "name": "_jobIds",
        "type": "bytes32[]"
    }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "response",
        "type": "int256"
    }, {
        "indexed": true,
        "name": "answerId",
        "type": "uint256"
    }, {
        "indexed": true,
        "name": "sender",
        "type": "address"
    }],
    "name": "ResponseReceived",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "current",
        "type": "int256"
    }, {
        "indexed": true,
        "name": "answerId",
        "type": "uint256"
    }],
    "name": "AnswerUpdated",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
    }],
    "name": "OwnershipRenounced",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
    }, {
        "indexed": true,
        "name": "newOwner",
        "type": "address"
    }],
    "name": "OwnershipTransferred",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "id",
        "type": "bytes32"
    }],
    "name": "ChainlinkRequested",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "id",
        "type": "bytes32"
    }],
    "name": "ChainlinkFulfilled",
    "type": "event"
}, {
    "anonymous": false,
    "inputs": [{
        "indexed": true,
        "name": "id",
        "type": "bytes32"
    }],
    "name": "ChainlinkCancelled",
    "type": "event"
}]

module.exports = {
    v2Contract,
    v1Contract,
};