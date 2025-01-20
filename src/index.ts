import { createPublicClient, webSocket, PublicClient, Abi, Address } from 'viem'
import { mainnet, sepolia } from 'viem/chains'
import logger from './logger/log';
import dotenv from 'dotenv';
import { ContractConfig } from './type';
import USDC_SEPOLIA_ABI from './abi/transferEvtAbi.json';
import { ContractListener } from './listener/ContractListener';
import { BITARENA_FACTORY_CONTRACT_ADDRESS, MAINNET_USDC_ADDRESS } from './constants/contractAddresses';
import { BITARENA_FACTORY_ABI } from './abi/FactoryABI';
import { ChallengeManager } from './listener/ChallengeManager';
import { challengeAbi } from './abi/BitarenaChallenge';

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

// Instantiate ChallengeManager
const challengeManager = new ChallengeManager(
  challengeAbi as Abi,
  sepolia,
  process.env.WS_URL_TESTNET || ''
);

/*
  Log event
*/
const logEvent = (logs: any): void => {
  if (logs[0].eventName === 'ChallengeDeployed') {
      const challengeAddress = logs[0].args.challengeAddress;
      challengeManager.createListener(challengeAddress);
  }
  console.log(logs);
}
    

const factoryListener = new ContractListener(usdcConfig);
const unwatchFunctions = factoryListener.watchEvents({ onLogs: logEvent });

// Handle a clean stop
process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  factoryListener.stopWatching(unwatchFunctions);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down...');
  factoryListener.stopWatching(unwatchFunctions);
  process.exit(0);
});
