import { createPublicClient, webSocket, PublicClient, Abi, Address } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import logger from './logger/log';
import dotenv from 'dotenv';
import { ContractConfig } from './type';
import USDC_SEPOLIA_ABI from './abi/transferEvtAbi.json';
import { ContractListener } from './listener/ContractListener';
import { BITARENA_FACTORY_CONTRACT_ADDRESS, MAINNET_USDC_ADDRESS } from './constants/contractAddresses';
import { BITARENA_FACTORY_ABI } from './abi/FactoryABI';

dotenv.config();


//Config to listen USDC on ethereum mainnet
/*
const usdcConfig: ContractConfig = {
  address: MAINNET_USDC_ADDRESS,
  abi: USDC_SEPOLIA_ABI as Abi,
  chain: mainnet,
  events: ['Transfer', 'Approval'],
  rpcUrl: process.env.WS_URL_MAINNET || ''
};

const cListener = new ContractListener(usdcConfig);
const unwatchFunctions = cListener.watchEvents();

*/


//Config to listen Bitarena Factory on ethereum testnet
const usdcConfig: ContractConfig = {
  address: BITARENA_FACTORY_CONTRACT_ADDRESS,
  abi: BITARENA_FACTORY_ABI as Abi,
  chain: sepolia,
  events: ['ChallengeDeployed'],
  rpcUrl: process.env.WS_URL_TESTNET || ''
};

const cListener = new ContractListener(usdcConfig);
const unwatchFunctions = cListener.watchEvents();

// Handle a clean stop
process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    cListener.stopWatching(unwatchFunctions);
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    cListener.stopWatching(unwatchFunctions);
    process.exit(0);
  });
  