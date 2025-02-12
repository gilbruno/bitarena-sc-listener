import { BITARENA_CHALLENGES_DATA_CONTRACT_ADDRESS } from "../../constants/contractAddresses";
import dotenv from 'dotenv';
import { sepolia } from "viem/chains";
import { Abi } from "viem";
import { ContractConfig } from "../../types/types";
import { challengeDataAbi } from "../../abi/BitarenaChallengesData";

dotenv.config();

 //Config to listen Bitarena Factory on ethereum testnet
 export const challengesDataConfig: ContractConfig = {
  address: BITARENA_CHALLENGES_DATA_CONTRACT_ADDRESS,
  abi: challengeDataAbi as Abi,
  chain: sepolia,
  events: ['ChallengeContractRegistered', 'ChallengeAddedToHistory', 'ChallengeEnded', 'WinnersClaimedCountUpdated'],
  rpcUrl: process.env.WS_URL_TESTNET || ''
};
