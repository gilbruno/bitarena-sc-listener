import { Address, ByteArray, decodeAbiParameters, decodeEventLog, hexToBytes } from "viem";
import { loggerWithTimestamp, loggerWithoutTimestamp } from "../../logger/log";
import prisma from "../../prisma/client";
import { challengeDataAbi } from "../../abi/BitarenaChallengesData";
import { DecodedEventLogChallengeData, Challenge, abiChallenge } from "../../types/types";



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

    await prisma.challenge.create({
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
  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors de l'enregistrement du challenge: ${error}`);
  }
};

/**
 * Met à jour le statut d'un challenge à FINISHED
 */
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


export const logEventsChallengesData = async (logs: any): Promise<void> => {
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
      const challengeAddress = event.address // L'adresse du contrat qui a émis l'événement
      await handleChallengeEnded(challengeAddress)
      break;
  }
  
}
