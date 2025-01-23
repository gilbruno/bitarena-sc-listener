import {loggerWithTimestamp, loggerWithoutTimestamp} from './logger/log';
import dotenv from 'dotenv';
import { ContractListener } from './listener/ContractListener';
import { logEventsChallengesData } from './listener/ChallengesData/ChalengesDataListener';
import { challengesDataConfig } from './listener/ChallengesData/ChallengesDataConfig';
import { gamesConfig } from './listener/Games/GamesConfig';
import { logEventsGames } from './listener/Games/GamesListener';
import { Abi, decodeEventLog } from 'viem';
import { DecodeEventLogReturnType } from 'viem';
import { ContractConfig } from './type';
import { sepolia } from 'viem/chains';
import { BITARENA_GAMES_CONTRACT_ADDRESS } from './constants/contractAddresses';
import { gamesAbi } from './abi/BitarenaGames';

dotenv.config();

/** LISTENER FOR BITARENA GAMES */
const gamesListener = new ContractListener(gamesConfig);
const unwatchFunctionsGames = gamesListener.watchEvents({ onLogs: logEventsGames });



/** LISTENER FOR BITARENA CHALLENGES DATA */
const challengesDataListener = new ContractListener(challengesDataConfig);
const unwatchFunctionsChallengesData = challengesDataListener.watchEvents({ onLogs: logEventsChallengesData  });

// Handle a clean stop
process.on('SIGINT', async () => {
  loggerWithTimestamp.info('Shutting down...');
  challengesDataListener.stopWatching(unwatchFunctionsChallengesData);
  gamesListener.stopWatching(unwatchFunctionsGames);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  loggerWithTimestamp.info('Shutting down...');
  challengesDataListener.stopWatching(unwatchFunctionsChallengesData);
  gamesListener.stopWatching(unwatchFunctionsGames);
  process.exit(0);
});

