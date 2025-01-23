import { decodeEventLog, DecodeEventLogReturnType } from "viem";
import {loggerWithTimestamp, loggerWithoutTimestamp} from "../../logger/log";
import { gamesConfig } from "./GamesConfig";


/**
 * Enregistre un nouveau jeu dans la base de données
 * @param game - Le nom du jeu
 */
export const handleGameAdded = async (game: string): Promise<void> => {
    try {
        await prisma.game.create({
          data: {
            name: game
          }
        });
        loggerWithTimestamp.info(`Nouveau jeu enregistré - Nom: ${game}`);
      } catch (error) {
        loggerWithTimestamp.error(`Erreur lors de l'enregistrement du jeu: ${error}`);
      }
};

/**
 * Enregistre une nouvelle plateforme dans la base de données
 * @param game - Le nom de la plateforme
 */
export const handlePlatformAdded = async (game: string): Promise<void> => {
    try {
        await prisma.game.create({
          data: {
            name: game
          }
        });
        loggerWithTimestamp.info(`Nouvelle plateforme enregistrée - Nom: ${game}`);
      } catch (error) {
        loggerWithTimestamp.error(`Erreur lors de l'enregistrement de la plateforme: ${error}`);
      }
};

/**
 * Décode les événements de Bitarena Games
 * @param logs - Les logs à décoder
 */
export const logEventsGames = async (logs: any): Promise<void> => {
  const event = logs[0];

  let decodedData
  switch (event.eventName) {  
    case 'GameAdded':
      // Décodage des données de l'événement
      decodedData = decodeEventLog({
        abi: gamesConfig.abi,
        data: event.data,
        topics: event.topics,
        eventName: 'GameAdded'
      }) as DecodeEventLogReturnType <typeof gamesConfig.abi, 'GameAdded'>;
      
      const game = decodedData?.args?.[0];
      if (!game) {
        loggerWithTimestamp.error('Game name not found in event data');
        return;
      }
      await handleGameAdded(game as string);
      break;

    case 'PlatformAdded':
      // Décodage des données de l'événement
      decodedData = decodeEventLog({
        abi: gamesConfig.abi,
        data: event.data,
        topics: event.topics,
        eventName: 'PlatformAdded'
      }) as DecodeEventLogReturnType <typeof gamesConfig.abi, 'PlatformAdded'>;
      
      const platform = decodedData?.args?.[0];
      if (!platform) {
        loggerWithTimestamp.error('Platform name not found in event data');
        return;
      }
      await handlePlatformAdded(platform as string);
      break;
  }
  console.log(logs);
}
