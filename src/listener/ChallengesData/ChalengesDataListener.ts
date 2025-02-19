import { Address, ByteArray, decodeAbiParameters, decodeEventLog, hexToBytes } from "viem";
import { loggerWithTimestamp, loggerWithoutTimestamp } from "../../logger/log";
import prisma from "../../prisma/client";
import { challengeDataAbi } from "../../abi/BitarenaChallengesData";
import { DecodedEventLogChallengeData, Challenge, DecodedEventLogChallengeHistoryData, DecodedEventLogChallengeEndedData, DecodedEventLogChallengeWinnersClaimedCountUpdated, DecodedEventLogChallengePoolUpdated, DecodedEventLogChallengeWinnerTeamUpdated } from "../../types/types";


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
  challengeData: Challenge,
  blockNumber: bigint,
  txHash: string
): Promise<void> => {

  try {
    const game = await prisma.game.findFirst({
      where: { name: challengeData.game }
    });

    const platform = await prisma.platform.findFirst({
      where: { name: challengeData.platform }
    });

    if (!game || !platform) {
      loggerWithoutTimestamp.error(`Game ou Platform non trouvé pour le challenge ${challengeContract}`);
      return;
    }

    // Trouver l'utilisateur par son adresse wallet
    const wallet = await prisma.wallet.findUnique({
      where: { address: challengeData.challengeCreator },
      include: { user: true }
    });
    if (!wallet) {
      loggerWithoutTimestamp.error(`Wallet non trouvé pour l'adresse ${challengeData.challengeCreator}`);
      return;
    }

    const createdChallenge = await prisma.challenge.create({
      data: {
        challengeAddress: challengeContract as string,
        challengeCreator: wallet.userId,
        gameId: game.id,
        platformId: platform.id,
        nbTeams: Number(challengeData.nbTeams),
        nbTeamPlayers: Number(challengeData.nbTeamPlayers),
        startAt: new Date(Number(challengeData.startAt) * 1000),
        isPrivate: challengeData.isPrivate,
        state: 'CREATED',
        blockNumber,
        txHash,
        entryFee: Number(challengeData.amountPerPlayer),
        pool: 0,
        winnersClaimedCount: 0,
        delayStartVictoryClaim: Number(challengeData.delayStartVictoryClaim),
        delayEndVictoryClaim: Number(challengeData.delayEndVictoryClaim),
        winnerTeam: 0,
        delayStartDisputeParticipation: Number(challengeData.delayStartDisputeParticipation),
        delayEndDisputeParticipation: Number(challengeData.delayEndDisputeParticipation),
        feePercentageDispute: Number(challengeData.feePercentageDispute)
      }
    });

    loggerWithoutTimestamp.info(`Challenge enregistré avec succès: ${challengeContract}`);

    // Création de la participation pour le créateur
    await createParticipation(createdChallenge.id, wallet.userId, challengeData.challengeCreator, 1);

  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors de l'enregistrement du challenge: ${error}`);
  }
};

//-------------------------------------------------------------------
// Gestion de l'event ChallengePoolUpdated
//-------------------------------------------------------------------
export const handleChallengePoolUpdated = async (
  challengeAddress: string,
  pool: bigint
): Promise<void> => {

  try {
    // Trouver le challenge par son adresse
    const challenge = await prisma.challenge.findUnique({
      where: { challengeAddress: challengeAddress }
    });
    if (!challenge) {
      loggerWithoutTimestamp.error(`--- handleChallengePoolUpdated : Challenge non trouvé pour l'adresse ${challengeAddress}`);
      return;
    }

    await prisma.challenge.update({
      where: {
        challengeAddress: challengeAddress
      },
      data: {
        pool: Number(pool)
      }
    });

    loggerWithoutTimestamp.info(`Champ pool mis à jour avec succès pour le challenge : ${challengeAddress}`);

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
    //await createParticipation(challenge.id, wallet.userId, playerAddress, teamId);

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
    // Grouper les événements par transaction
    const eventsByTx = logs.reduce((acc: any, event: any) => {
      const txHash = event.transactionHash;
      if (!acc[txHash]) acc[txHash] = [];
      acc[txHash].push(event);
      return acc;
    }, {});

    // Traiter chaque transaction séquentiellement
    for (const txHash in eventsByTx) {
      const txEvents = eventsByTx[txHash];
      
      // Traiter d'abord ChallengeContractRegistered
      const registerEvent = txEvents.find((e: any) => e.eventName === 'ChallengeContractRegistered');
      if (registerEvent) {
        console.log(' ----- Event captured : ChallengeContractRegistered');
        const decodedData = decodeEventLog({
          abi: challengeDataAbi,
          data: registerEvent.data,
          topics: registerEvent.topics,
          eventName: 'ChallengeContractRegistered'
        }) as unknown as DecodedEventLogChallengeData;

        const logData = JSON.stringify(decodedData, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
        );
        loggerWithoutTimestamp.info(` ----- decodedData : ${logData}`);

        let { challengeContract, challengeData } = decodedData.args;
        await handleChallengeContractRegistered(challengeContract as Address, challengeData, registerEvent.blockNumber, txHash);
      }

      // Attendre que l'enregistrement soit terminé
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Traiter les autres événements de la transaction
      for (const event of txEvents) {
        if (event.eventName === 'ChallengeContractRegistered') continue;

        console.log(' ----- Event captured : ', event.eventName);
        loggerWithoutTimestamp.info(` ----- Event captured : ${event.eventName}`);

        switch (event.eventName) {
          case 'ChallengePoolUpdated':
            const decodedPoolData = decodeEventLog({
              abi: challengeDataAbi,
              data: event.data,
              topics: event.topics,
              eventName: 'ChallengePoolUpdated'
            }) as unknown as DecodedEventLogChallengePoolUpdated;

            const logPoolData = JSON.stringify(decodedPoolData, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value
            );
            loggerWithoutTimestamp.info(` ----- decodedPoolData : ${logPoolData}`);
    
    
            let { challengeAddress: challengeAddressPoolUpdated, newPoolAmount } = decodedPoolData.args;
            await handleChallengePoolUpdated(challengeAddressPoolUpdated, newPoolAmount);
            break;

          case 'WinnersClaimedCountUpdated':
            const decodedWinnersData = decodeEventLog({
              abi: challengeDataAbi,
              data: event.data,
              topics: event.topics,
              eventName: 'WinnersClaimedCountUpdated'
            }) as unknown as DecodedEventLogChallengeWinnersClaimedCountUpdated;

            let { challengeContract: challengeContractWinnersClaimedCountUpdated, winnersClaimedCount } = decodedWinnersData.args;
            await handleWinnersClaimedCountUpdated(challengeContractWinnersClaimedCountUpdated as Address, winnersClaimedCount);
            break;

          case 'WinnerTeamUpdated':
            const decodedWinnerData = decodeEventLog({
              abi: challengeDataAbi,
              data: event.data,
              topics: event.topics,
              eventName: 'WinnerTeamUpdated'
            }) as unknown as DecodedEventLogChallengeWinnerTeamUpdated;

            let { challengeContract: challengeContractWinnerTeamUpdated, winnerTeam } = decodedWinnerData.args;
            await handleWinnerTeamUpdated(challengeContractWinnerTeamUpdated as Address, winnerTeam);
            break;

          case 'ChallengeAddedToPlayerHistory':
            const decodedHistoryData = decodeEventLog({
              abi: challengeDataAbi,
              data: event.data,
              topics: event.topics,
              eventName: 'ChallengeAddedToPlayerHistory'
            }) as unknown as DecodedEventLogChallengeHistoryData;

            const { player, challengeAddress, teamIndex } = decodedHistoryData.args;
            await handleChallengeAddedToPlayerHistory(player, challengeAddress, teamIndex);
            break;

          case 'ChallengeEnded':
            const decodedEndData = decodeEventLog({
              abi: challengeDataAbi,
              data: event.data,
              topics: event.topics,
              eventName: 'ChallengeEnded'
            }) as unknown as DecodedEventLogChallengeEndedData;

            const { challengeEndedAddress } = decodedEndData.args;
            await handleChallengeEnded(challengeEndedAddress);
            break;
        }
      }
    }
  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors du traitement de l'événement: ${error}`);
  }
};