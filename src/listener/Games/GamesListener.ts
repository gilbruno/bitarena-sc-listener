import { decodeEventLog, DecodeEventLogReturnType } from "viem";
import {loggerWithTimestamp, loggerWithoutTimestamp} from "../../logger/log";
import { gamesConfig } from "./GamesConfig";
import { DecodedEventLogGameData } from "../../types/types";
import prisma from "../../prisma/client";

/**
 * Enregistre un nouveau jeu dans la base de données
 * @param game - Le nom du jeu
 */
export const handleGameAdded = async (game: string, blockNumber: bigint, txHash: string): Promise<void> => {
    try {
        await prisma.game.create({
          data: {
            name: game,
            blockNumber,
            txHash
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
export const handlePlatformAdded = async (platform: string, blockNumber: bigint, txHash: string): Promise<void> => {
    try {
        await prisma.game.create({
          data: {
            name: platform,
            blockNumber,
            txHash
          }
        });
        loggerWithTimestamp.info(`Nouvelle plateforme enregistrée - Nom: ${platform}`);
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
  const blockNumber = event.blockNumber;
  const txHash = event.transactionHash;
  
  let decodedData: DecodedEventLogGameData;

  switch (event.eventName) {  
    case 'GameAdded':
      // Décodage des données de l'événement
      decodedData = decodeEventLog({
        abi: gamesConfig.abi,
        data: event.data,
        topics: event.topics,
        eventName: 'GameAdded'
      }) as DecodedEventLogGameData;
      
      const game = decodedData.args.game;
      if (!game) {
        loggerWithTimestamp.error('Game name not found in event data');
        return;
      }
      await handleGameAdded(game as string, blockNumber, txHash);
      break;

    case 'PlatformAdded':
      // Décodage des données de l'événement
      decodedData = decodeEventLog({
        abi: gamesConfig.abi,
        data: event.data,
        topics: event.topics,
        eventName: 'PlatformAdded'
      }) as DecodedEventLogGameData;
      const platform = decodedData.args.platform;
      if (!platform) {
        loggerWithTimestamp.error('Platform name not found in event data');
        return;
      }
      await handlePlatformAdded(platform as string, blockNumber, txHash);
      break;
  }
  console.log(logs);
}
