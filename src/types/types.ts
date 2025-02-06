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
      challengeParams: Challenge;
  };
  eventName: 'ChallengeContractRegistered';
}

export type DecodedEventLogChallengeHistoryData = {
  args: {
      player: string;
      challengeAddress: string;
  };
  eventName: 'ChallengeAddedToHistory';
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
}


export const abiChallenge = [
  {
    name: 'getChallengeParams',
    outputs: [
      {
          components: [
              { name: 'challengeAddress', type: 'address' },
              { name: 'challengeCreator', type: 'address' },
              { name: 'challengeAdmin', type: 'address' },
              { name: 'challengeDisputeAdmin', type: 'address' },
              { name: 'game', type: 'string' },
              { name: 'platform', type: 'string' },
              { name: 'nbTeams', type: 'uint16' },
              { name: 'nbTeamPlayers', type: 'uint16' },
              { name: 'amountPerPlayer', type: 'uint256' },
              { name: 'startAt', type: 'uint256' },
              { name: 'isPrivate', type: 'bool' }
          ],
          name: 'ChallengeParams',
          type: 'tuple',
      },
  ],
}
] as const
