import { BITARENA_GAMES_CONTRACT_ADDRESS } from "../../constants/contractAddresses";
import dotenv from 'dotenv';
import { sepolia } from "viem/chains";
import { Abi } from "viem";
import { ContractConfig } from "../../types/types";

import { gamesAbi } from "../../abi/BitarenaGames";

dotenv.config();

 //Config to listen Bitarena Factory on ethereum testnet
 export const gamesConfig: ContractConfig = {
  address: BITARENA_GAMES_CONTRACT_ADDRESS,
  abi: gamesAbi as Abi,
  chain: sepolia,
  events: ['GameAdded', 'PlatformAdded'],
  rpcUrl: process.env.WS_URL_TESTNET || ''
};
