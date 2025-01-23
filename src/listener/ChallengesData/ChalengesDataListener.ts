import {loggerWithTimestamp, loggerWithoutTimestamp} from "../../logger/log";
import prisma from "../../prisma/client";

export const handleChallengeContractRegistered = async (challengeContract: string, challengeParams: any): Promise<void> => {
  /*
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

    loggerWithoutTimestamp.info(`Challenge enregistré avec succès: ${challengeContract}`);

  } catch (error) {
    loggerWithoutTimestamp.error(`Erreur lors de l'enregistrement du challenge: ${error}`);
  }
    */
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
