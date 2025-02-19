import { Address, Chain, Abi } from "viem";


export interface ContractConfig {
  address: Address;
  abi: Abi;
  chain: Chain
  events: string[];
  rpcUrl: string
}

export type DecodedEventLogGameData = {
  args: {
    game?: string;
    platform?: string;
  },
  eventName: 'GameAdded' | 'PlatformAdded';
}

export type DecodedEventLogChallengeData = {
  args: {
    challengeContract: string;
    challengeData: Challenge;
  };
  eventName: 'ChallengeContractRegistered';
}

export type DecodedEventLogChallengeHistoryData = {
  args: {
    player: string;
    challengeAddress: string;
    teamIndex: number;
  };
  eventName: 'ChallengeAddedToPlayerHistory';
}

export type DecodedEventLogChallengeWinnersClaimedCountUpdated = {
  args: {
    challengeContract: string;
    winnersClaimedCount: number;
  };
  eventName: 'WinnersClaimedCountUpdated';
}

export type DecodedEventLogChallengePoolUpdated = {
  args: {
    challengeAddress: string;
    newPoolAmount: bigint;
  };
  eventName: 'ChallengePoolUpdated';
}

export type DecodedEventLogChallengeWinnerTeamUpdated = {
  args: {
    challengeContract: string;
    winnerTeam: number;
  };
  eventName: 'WinnerTeamUpdated';
}

export type DecodedEventLogChallengeEndedData = {
  args: {
    challengeEndedAddress: string;
  };
  eventName: 'ChallengeEnded';
}


export type Challenge = {
  challengeAddress: string;
  challengeCreator: string;
  challengeAdmin: string;
  challengeDisputeAdmin: string;
  game: string;
  platform: string;
  nbTeams: number;
  nbTeamPlayers: number;
  amountPerPlayer: bigint;
  startAt: bigint;
  isPrivate: boolean;
  pool: bigint;
  winnerTeam: number;
  winnersClaimedCount: number;
  delayStartVictoryClaim: bigint;
  delayEndVictoryClaim: bigint;
  delayStartDisputeParticipation: bigint;
  delayEndDisputeParticipation: bigint;
  feePercentageDispute: bigint;
}

