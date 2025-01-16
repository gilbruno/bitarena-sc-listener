import { createPublicClient, webSocket, PublicClient, Abi, Address } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import logger from './logger/log';
import dotenv from 'dotenv';
import { ContractConfig } from './type';
import USDC_SEPOLIA_ABI from './abi/transferEvtAbi.json';
import { ContractListener } from './listener/ContractListener';
import { MAINNET_USDC_ADDRESS } from './constants/contractAddresses';

dotenv.config();


//Config to listen USDC on ethereuam mainnet
const usdcConfig: ContractConfig = {
  address: MAINNET_USDC_ADDRESS,
  abi: USDC_SEPOLIA_ABI as Abi,
  chain: mainnet,
  events: ['Transfer', 'Approval'],
  rpcUrl: process.env.WS_URL_MAINNET || ''
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
  