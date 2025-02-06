import { Address, ByteArray, decodeAbiParameters, decodeEventLog, hexToBytes } from "viem";
import { loggerWithTimestamp, loggerWithoutTimestamp } from "../../logger/log";
import prisma from "../../prisma/client";
import { challengeDataAbi } from "../../abi/BitarenaChallengesData";
import { DecodedEventLogChallengeData, Challenge, abiChallenge, DecodedEventLogChallengeHistoryData, DecodedEventLogChallengeEndedData } from "../../types/types";


//-------------------------------------------------------------------
// Création de la participation
//-------------------------------------------------------------------
const createParticipation = async (challengeId: string, userId: string, walletAddress: string): Promise<void> => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress }
    });

    if (!wallet) {
      loggerWithoutTimestamp.error(`Wallet non trouvé pour l'adresse ${walletAddress}`);
      return;
    }

    await prisma.participation.create({
      data: {
        userId,
        challengeId,
        walletId: wallet.id
      }
    });

    loggerWithoutTimestamp.info(`Participation créée pour le créateur du challenge ${challengeId}`);
  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors de la création de la participation: ${error}`);
  }
};


//-------------------------------------------------------------------
// Gestion de l'event ChallengeContractRegistered
//-------------------------------------------------------------------
export const handleChallengeContractRegistered = async (
  challengeContract: Address,
  challengeParams: Challenge,
  blockNumber: bigint,
  txHash: string
): Promise<void> => {

  try {
    const game = await prisma.game.findFirst({  
      where: { name: challengeParams.game }
    });

    const platform = await prisma.platform.findFirst({
      where: { name: challengeParams.platform }
    });

    if (!game || !platform) {
      loggerWithoutTimestamp.error(`Game ou Platform non trouvé pour le challenge ${challengeContract}`);
      return;
    }

    // Trouver l'utilisateur par son adresse wallet
    const wallet = await prisma.wallet.findUnique({
      where: { address: challengeParams.challengeCreator },
      include: { user: true }
    });
    if (!wallet) {
      loggerWithoutTimestamp.error(`Wallet non trouvé pour l'adresse ${challengeParams.challengeCreator}`);
      return;
    }

    const createdChallenge = await prisma.challenge.create({
      data: {
        challengeAddress: challengeContract as string,
        challengeCreator: wallet.userId,
        gameId: game.id,
        platformId: platform.id,
        nbTeams: Number(challengeParams.nbTeams),
        nbTeamPlayers: Number(challengeParams.nbTeamPlayers),
        startAt: new Date(Number(challengeParams.startAt) * 1000),
        isPrivate: challengeParams.isPrivate,
        state: 'CREATED',
        blockNumber,
        txHash
      }
    });

    loggerWithoutTimestamp.info(`Challenge enregistré avec succès: ${challengeContract}`);

     // Création de la participation pour le créateur
     await createParticipation(createdChallenge.id, wallet.userId, challengeParams.challengeCreator);

  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors de l'enregistrement du challenge: ${error}`);
  }
};

//-------------------------------------------------------------------
// Gestion de l'event ChallengeAddedToHistory
//-------------------------------------------------------------------
export const handleChallengeAddedToHistory = async (
  playerAddress: string,
  challengeAddress: string,
): Promise<void> => {
  try {
    // Trouver le challenge par son adresse
    const challenge = await prisma.challenge.findUnique({
      where: { challengeAddress: challengeAddress }
    });

    if (!challenge) {
      loggerWithoutTimestamp.error(`Challenge non trouvé pour l'adresse ${challengeAddress}`);
      return;
    }

    // Trouver le joueur par son adresse wallet
    const wallet = await prisma.wallet.findUnique({
      where: { address: playerAddress },
      include: { user: true }
    });
    if (!wallet) {
      loggerWithoutTimestamp.error(`Wallet non trouvé pour l'adresse ${playerAddress}`);
      return;
    }
    
    // Créer la participation pour le joueur
    await createParticipation(challenge.id, wallet.userId, playerAddress);  

    loggerWithoutTimestamp.info(`Participation créée pour le joueur ${wallet.userId} dans le challenge ${challengeAddress}`);
  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors de l'ajout de la participation à l'historique: ${error}`);
  }
};

//-------------------------------------------------------------------
// Gestion de l'event ChallengeEnded
//-------------------------------------------------------------------
export const handleChallengeEnded = async (challengeAddress: string): Promise<void> => {
  try {
    await prisma.challenge.update({
      where: {
        challengeAddress: challengeAddress
      },
      data: {
        state: 'FINISHED'
      }
    });

    loggerWithoutTimestamp.info(`Challenge ${challengeAddress} marqué comme terminé`);
  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors de la mise à jour du statut du challenge ${challengeAddress}: ${error}`);
  }
};


//-------------------------------------------------------------------
// Gestion des events
//-------------------------------------------------------------------
export const logEventsChallengesData = async (logs: any): Promise<void> => {
  try {
    const event = logs[0]
    const blockNumber = event.blockNumber
    const txHash = event.transactionHash

    loggerWithoutTimestamp.info(` ----- Event captured : ${event.eventName}`)

    switch (event.eventName) {
      case 'ChallengeContractRegistered':

        const decodedData = decodeEventLog({
          abi: challengeDataAbi,
          data: event.data,
          topics: event.topics,
          eventName: 'ChallengeContractRegistered'
        }) as unknown as DecodedEventLogChallengeData;

        const logData = {
          ...decodedData,
          args: {
            ...decodedData.args,
            challengeParams: {
              ...decodedData.args.challengeParams,
              amountPerPlayer: decodedData.args.challengeParams.amountPerPlayer.toString(),
              startAt: decodedData.args.challengeParams.startAt.toString()
            }
          }
        };
        loggerWithoutTimestamp.info(` ----- decodedData : ${JSON.stringify(logData)}`)

        const { challengeContract, challengeParams } = decodedData.args;

        loggerWithoutTimestamp.info(` ----- challengeContract : ${challengeContract}`)
          //const [challengeContract, challengeParams] = decodedData.args
          await handleChallengeContractRegistered(challengeContract as Address, challengeParams, blockNumber, txHash)
          break;

      case 'ChallengeEnded':
        const contractAddress = event.address // L'adresse du contrat qui a émis l'événement
        const decodedDataChallengeEnded = decodeEventLog({
          abi: challengeDataAbi,
          data: event.data,
          topics: event.topics,
          eventName: 'ChallengeEnded'
        }) as unknown as DecodedEventLogChallengeEndedData;

        const { challengeEndedAddress } = decodedDataChallengeEnded.args;

        await handleChallengeEnded(challengeEndedAddress)
        break;

      case 'ChallengeAddedToHistory':
        const decodedHistoryData = decodeEventLog({
          abi: challengeDataAbi,
          data: event.data,
          topics: event.topics,
          eventName: 'ChallengeAddedToHistory'
        }) as unknown as DecodedEventLogChallengeHistoryData;

        const { player, challengeAddress } = decodedHistoryData.args;
        await handleChallengeAddedToHistory(player, challengeAddress);
        break;
    }
  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors du traitement de l'événement: ${error}`);
  }
}
