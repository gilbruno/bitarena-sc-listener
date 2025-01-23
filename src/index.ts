import { createPublicClient, webSocket, PublicClient, Abi, Address } from 'viem'
import { mainnet, polygonAmoy, sepolia } from 'viem/chains'
import logger from './logger/log';
import dotenv from 'dotenv';
import { ContractConfig } from './type';
import USDC_SEPOLIA_ABI from './abi/transferEvtAbi.json';
import { ContractListener } from './listener/ContractListener';
import { BITARENA_CHALLENGES_DATA_CONTRACT_ADDRESS, BITARENA_FACTORY_CONTRACT_ADDRESS } from './constants/contractAddresses';
import { BITARENA_FACTORY_ABI } from './abi/FactoryABI';
import { ChallengeManager } from './listener/ChallengeManager';
import { challengeAbi } from './abi/BitarenaChallenge';
import { challengeDataAbi } from './abi/BitarenaChallengesData';

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
const listenerConfig: ContractConfig = {
  address: BITARENA_CHALLENGES_DATA_CONTRACT_ADDRESS,
  abi: challengeDataAbi as Abi,
  chain: sepolia,
  events: ['ChallengeContractRegistered','ChallengeAddedToHistory', 'ChallengeEnded'],
  rpcUrl: process.env.WS_URL_TESTNET || ''
};

// Instantiate ChallengeManager
/*const challengeManager = new ChallengeManager(
  challengeAbi as Abi,
  polygonAmoy,
  process.env.WS_URL_TESTNET || ''
);

/**
 * Gère l'enregistrement d'un nouveau challenge dans la base de données
 */
const handleChallengeContractRegistered = async (challengeContract: string, challengeParams: any): Promise<void> => {
  try {
    await prisma.challenge.create({
      data: {
        challengeAddress: challengeContract,
        challengeCreator: challengeParams.challengeCreator,
        game: challengeParams.game,
        platform: challengeParams.platform,
        nbTeams: Number(challengeParams.nbTeams),
        nbTeamPlayers: Number(challengeParams.nbTeamPlayers),
        startAt: new Date(Number(challengeParams.startAt) * 1000),
        isPrivate: challengeParams.isPrivate,
        state: 'CREATED'
      }
    });

    logger.info(`Challenge enregistré avec succès: ${challengeContract}`);
    
  } catch (error) {
    logger.error(`Erreur lors de l'enregistrement du challenge: ${error}`);
  }
};

/**
 * Met à jour le statut d'un challenge à FINISHED
 */
const handleChallengeEnded = async (challengeAddress: string): Promise<void> => {
  try {
    await prisma.challenge.update({
      where: {
        challengeAddress: challengeAddress
      },
      data: {
        state: 'FINISHED'
      }
    });

    logger.info(`Challenge ${challengeAddress} marqué comme terminé`);
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du statut du challenge ${challengeAddress}: ${error}`);
  }
};

/*
  Log event
*/
const logEvent = async (logs: any): Promise<void> => {
  const event = logs[0];
  
  switch (event.eventName) {
    case 'ChallengeContractRegistered':
      const { challengeContract, challengeParams } = event.args;
      await handleChallengeContractRegistered(challengeContract, challengeParams);
      break;
      
    case 'ChallengeEnded':
      const challengeAddress = event.address; // L'adresse du contrat qui a émis l'événement
      await handleChallengeEnded(challengeAddress);
      break;
  }
  console.log(logs);
}
    

const factoryListener = new ContractListener(listenerConfig);
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
