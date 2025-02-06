import {loggerWithTimestamp, loggerWithoutTimestamp} from './logger/log';
import dotenv from 'dotenv';
import { ContractListener } from './listener/ContractListener';
import { logEventsChallengesData } from './listener/ChallengesData/ChalengesDataListener';
import { challengesDataConfig } from './listener/ChallengesData/ChallengesDataConfig';
import { gamesConfig } from './listener/Games/GamesConfig';
import { logEventsGames } from './listener/Games/GamesListener';

dotenv.config();

const listenerType = process.argv[2]; // Récupère l'argument passé en ligne de commande

if (!listenerType || (listenerType !== 'games' && listenerType !== 'challenges')) {
  loggerWithTimestamp.error('Veuillez spécifier le type de listener: games ou challenges');
  process.exit(1);
}
if (listenerType === 'games') {
  /** LISTENER FOR BITARENA GAMES */
  const gamesListener = new ContractListener(gamesConfig);
  const unwatchFunctionsGames = gamesListener.watchEvents({ onLogs: logEventsGames });

  // Handle a clean stop
  process.on('SIGINT', async () => {
    loggerWithTimestamp.info('Shutting down games listener...');
    gamesListener.stopWatching(unwatchFunctionsGames);
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    loggerWithTimestamp.info('Shutting down games listener...');
    gamesListener.stopWatching(unwatchFunctionsGames);
    process.exit(0);
  });
} else {
  /** LISTENER FOR BITARENA CHALLENGES DATA */
  const challengesDataListener = new ContractListener(challengesDataConfig);
  const unwatchFunctionsChallengesData = challengesDataListener.watchEvents({ onLogs: logEventsChallengesData });

  // Handle a clean stop
  process.on('SIGINT', async () => {
    loggerWithTimestamp.info('Shutting down challenges listener...');
    challengesDataListener.stopWatching(unwatchFunctionsChallengesData);
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    loggerWithTimestamp.info('Shutting down challenges listener...');
    challengesDataListener.stopWatching(unwatchFunctionsChallengesData);
    process.exit(0);
  });
}