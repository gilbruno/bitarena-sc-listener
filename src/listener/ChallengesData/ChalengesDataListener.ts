import { Address, ByteArray, decodeAbiParameters, decodeEventLog, hexToBytes } from "viem";
import { loggerWithTimestamp, loggerWithoutTimestamp } from "../../logger/log";
import prisma from "../../prisma/client";
import { challengeDataAbi } from "../../abi/BitarenaChallengesData";
import { DecodedEventLogChallengeData, Challenge, abiChallenge, DecodedEventLogChallengeHistoryData, DecodedEventLogChallengeEndedData, DecodedEventLogChallengeWinnersClaimedCountUpdated, DecodedEventLogChallengePoolUpdated, DecodedEventLogChallengeWinnerTeamUpdated } from "../../types/types";


//-------------------------------------------------------------------
// Création de la participation
//-------------------------------------------------------------------
const createParticipation = async (challengeId: string, userId: string, walletAddress: string, teamId: number): Promise<void> => {
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
        walletId: wallet.id,
        teamId: teamId  
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
        txHash,
        entryFee: Number(challengeParams.amountPerPlayer),
        pool: 0,
        winnersClaimedCount: 0,
        delayStartVictoryClaim: Number(challengeParams.delayStartVictoryClaim),
        delayEndVictoryClaim: Number(challengeParams.delayEndVictoryClaim),
        winnerTeam: 0,
        delayStartDisputeParticipation: Number(challengeParams.delayStartDisputeParticipation),
        delayEndDisputeParticipation: Number(challengeParams.delayEndDisputeParticipation),
        feePercentageDispute: Number(challengeParams.feePercentageDispute)
      }
    });

    loggerWithoutTimestamp.info(`Challenge enregistré avec succès: ${challengeContract}`);

    // Création de la participation pour le créateur
    await createParticipation(createdChallenge.id, wallet.userId, challengeParams.challengeCreator, 1);

  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors de l'enregistrement du challenge: ${error}`);
  }
};

//-------------------------------------------------------------------
// Gestion de l'event ChallengePoolUpdated
//-------------------------------------------------------------------
export const handleChallengePoolUpdated = async (
  challengeContract: Address,
  pool: bigint
): Promise<void> => {

  try {
    // Trouver le challenge par son adresse
    const challenge = await prisma.challenge.findUnique({
      where: { challengeAddress: challengeContract }
    });
    if (!challenge) {
      loggerWithoutTimestamp.error(`--- handleChallengePoolUpdated : Challenge non trouvé pour l'adresse ${challengeContract}`);
      return;
    }

    await prisma.challenge.update({
      where: {
        challengeAddress: challengeContract
      },
      data: {
        pool: Number(pool)
      }
    });

    loggerWithoutTimestamp.info(`Champ pool mis à jour avec succès pour le challenge : ${challengeContract}`);

  } catch (error) {
    loggerWithoutTimestamp.error(`--- handleChallengePoolUpdated : Erreur lors de l'enregistrement du challenge: ${error}`);
  }
};

//-------------------------------------------------------------------
// Gestion de l'event WinnersClaimedCountUpdated
//-------------------------------------------------------------------
export const handleWinnersClaimedCountUpdated = async (
  challengeContract: Address,
  winnersClaimedCount: number
): Promise<void> => {

  try {
    // Trouver le challenge par son adresse
    const challenge = await prisma.challenge.findUnique({
      where: { challengeAddress: challengeContract }
    });
    if (!challenge) {
      loggerWithoutTimestamp.error(`--- handleWinnersClaimedCountUpdated : Challenge non trouvé pour l'adresse ${challengeContract}`);
      return;
    }

    await prisma.challenge.update({
      where: {
        challengeAddress: challengeContract
      },
      data: {
        winnersClaimedCount: winnersClaimedCount
      }
    });

    loggerWithoutTimestamp.info(`Champ winnersClaimedCount mis à jour avec succès: ${challengeContract}`);


  } catch (error) {
    loggerWithoutTimestamp.error(`--- handleWinnersClaimedCountUpdated : Erreur lors de l'enregistrement du challenge: ${error}`);
  }
};

//-------------------------------------------------------------------
// Gestion de l'event WinnerTeamUpdated
//-------------------------------------------------------------------
export const handleWinnerTeamUpdated = async (
  challengeContract: Address,
  winnerTeam: number
): Promise<void> => {
  try {
    // Trouver le challenge par son adresse
    const challenge = await prisma.challenge.findUnique({
      where: { challengeAddress: challengeContract }
    });
    if (!challenge) {
      loggerWithoutTimestamp.error(`--- handleWinnerTeamUpdated : Challenge non trouvé pour l'adresse ${challengeContract}`);
      return;
    }

    await prisma.challenge.update({ 
      where: {
        challengeAddress: challengeContract
      },
      data: {
        winnerTeam: winnerTeam
      }
    });

    loggerWithoutTimestamp.info(`Champ winnerTeam mis à jour avec succès: ${challengeContract}`);

  } catch (error) {
    loggerWithoutTimestamp.error(`--- handleWinnerTeamUpdated : Erreur lors de l'enregistrement du challenge: ${error}`);
  }
};


//-------------------------------------------------------------------
// Gestion de l'event ChallengeAddedToPlayerHistory
//-------------------------------------------------------------------
export const handleChallengeAddedToPlayerHistory = async (
  playerAddress: string,
  challengeAddress: string,
  teamId: number
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
    await createParticipation(challenge.id, wallet.userId, playerAddress, teamId);

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
      //----------------------------------- EVENT ChallengeContractRegistered
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

        let { challengeContract: challengeContractRegistered, challengeParams } = decodedData.args; 

        loggerWithoutTimestamp.info(` ----- challengeContractRegistered : ${challengeContractRegistered}`)
        //const [challengeContract, challengeParams] = decodedData.args
        await handleChallengeContractRegistered(challengeContractRegistered as Address, challengeParams, blockNumber, txHash)
        break;

      //----------------------------------- EVENT WinnersClaimedCountUpdated
      case 'WinnersClaimedCountUpdated':
        const decodedDataWinnersClaimedCountUpdated = decodeEventLog({
          abi: challengeDataAbi,
          data: event.data,
          topics: event.topics,
          eventName: 'WinnersClaimedCountUpdated'
        }) as unknown as DecodedEventLogChallengeWinnersClaimedCountUpdated;

        let { challengeContract: challengeContractWinnersClaimedCountUpdated, winnersClaimedCount } = decodedDataWinnersClaimedCountUpdated.args;
        await handleWinnersClaimedCountUpdated(challengeContractWinnersClaimedCountUpdated as Address, winnersClaimedCount);

        break;

      //----------------------------------- EVENT ChallengePoolUpdated
      case 'ChallengePoolUpdated':
        const decodedDataChallengePoolUpdated = decodeEventLog({
          abi: challengeDataAbi,
          data: event.data,
          topics: event.topics,
          eventName: 'ChallengePoolUpdated'
        }) as unknown as DecodedEventLogChallengePoolUpdated;

        let { challengeContract: challengeContractPoolUpdated, pool } = decodedDataChallengePoolUpdated.args;
        await handleChallengePoolUpdated(challengeContractPoolUpdated as Address, pool);

        break;

      //----------------------------------- EVENT WinnerTeamUpdated
      case 'WinnerTeamUpdated':
        const decodedDataWinnerTeamUpdated = decodeEventLog({
          abi: challengeDataAbi,
          data: event.data,
          topics: event.topics,
          eventName: 'WinnerTeamUpdated'
        }) as unknown as DecodedEventLogChallengeWinnerTeamUpdated; 

        let { challengeContract: challengeContractWinnerTeamUpdated, winnerTeam } = decodedDataWinnerTeamUpdated.args;
        await handleWinnerTeamUpdated(challengeContractWinnerTeamUpdated as Address, winnerTeam);

        break;

      //----------------------------------- EVENT ChallengeAddedToPlayerHistory
      case 'ChallengeAddedToPlayerHistory':
          const decodedHistoryData = decodeEventLog({
            abi: challengeDataAbi,
            data: event.data,
            topics: event.topics,
            eventName: 'ChallengeAddedToPlayerHistory'
          }) as unknown as DecodedEventLogChallengeHistoryData;
  
          const { player, challengeAddress, teamId } = decodedHistoryData.args;
          await handleChallengeAddedToPlayerHistory(player, challengeAddress, teamId);
          break;

      //----------------------------------- EVENT ChallengeEnded
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

    }
  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors du traitement de l'événement: ${error}`);
  }
}
