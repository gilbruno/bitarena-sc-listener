export const factoryAbi = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "BITARENA_FACTORY_ADMIN",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "DEFAULT_ADMIN_ROLE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createChallenge",
    "inputs": [
      {
        "name": "_challengeAdmin",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_challengeDisputeAdmin",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_challengeCounter",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract BitarenaChallenge"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "deployAndCreateChallenge",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getChallengeByIndex",
    "inputs": [
      {
        "name": "index",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct Challenge",
        "components": [
          {
            "name": "challengeCreator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "challengeAddress",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "game",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "platform",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "nbTeams",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "nbTeamPlayers",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "amountPerPlayer",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "startAt",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "isPrivate",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getChallengeCounter",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getChallengesArray",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Challenge[]",
        "components": [
          {
            "name": "challengeCreator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "challengeAddress",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "game",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "platform",
            "type": "bytes32",
            "internalType": "bytes32"
          },
          {
            "name": "nbTeams",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "nbTeamPlayers",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "amountPerPlayer",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "startAt",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "isPrivate",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRoleAdmin",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "grantRole",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "hasRole",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "intentChallengeCreation",
    "inputs": [
      {
        "name": "_game",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_platform",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_nbTeams",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "_nbTeamPlayers",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "_amountPerPlayer",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_startAt",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_isPrivate",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "isChallengeDeployed",
    "inputs": [
      {
        "name": "index",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "renounceRole",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "callerConfirmation",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeRole",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      {
        "name": "interfaceId",
        "type": "bytes4",
        "internalType": "bytes4"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "ChallengeDeployed",
    "inputs": [
      {
        "name": "challengeCounter",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "challengeAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "challengeFactoryAddress",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "IntentChallengeCreation",
    "inputs": [
      {
        "name": "challengeCounter",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RoleAdminChanged",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "previousAdminRole",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "newAdminRole",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RoleGranted",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "account",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "RoleRevoked",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "account",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "sender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AccessControlBadConfirmation",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AccessControlUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "neededRole",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ]
  },
  {
    "type": "error",
    "name": "BalanceChallengeCreatorError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ChallengeAdminAddressZeroError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ChallengeCounterError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ChallengeCreatorAddressZeroError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ChallengeDeployedError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ChallengeDisputeAdminAddressZeroError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ChallengeGameError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ChallengePlatformError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ChallengeStartDateError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NbPlayersPerTeamsError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NbTeamsError",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "SendMoneyToChallengeError",
    "inputs": []
  }
]
