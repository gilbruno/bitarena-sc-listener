import { Web3, WebSocketProvider } from 'web3';
import { BlockchainConfig } from './type';
import logger from './logger/log';
import dotenv from 'dotenv';
import USDT_ABI from './abi/0xdAC17F958D2ee523a2206206994597C13D831ec7.json';
import USDC_SEPOLIA_ABI from './abi/0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9.json';

dotenv.config();

export const abi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'total',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'tokens',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenOwner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'numTokens',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'buyer',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'numTokens',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;



(async () => {
  const web3 = new Web3(
    new WebSocketProvider('wss://ethereum-rpc.publicnode.com')
  );

  async function subscribe() {
    // // create a new contract object, providing the ABI and address
    const address = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'; // USDC contract
    const contract = new web3.eth.Contract(abi, address);

    // subscribe to the smart contract Transfer event
    const subscription = contract.events.Transfer();

    // new value every time the event is emitted
    subscription.on('data', (d: any) => {
      console.log((
        `\nAmount: ${d.returnValues.tokens.toString()}\nFrom: ${
          d.returnValues.from
        }\nTo: ${d.returnValues.to}\n`)
    )});
    

    return subscription;
  }

  // function to unsubscribe from a subscription
  async function unsubscribe(subscription: any) {
    await subscription.unsubscribe();
  }

  const subsccription = subscribe();
  // unsubscribe(subscription);
})();
