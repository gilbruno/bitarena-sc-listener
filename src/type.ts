import { Abi, Address, Chain } from "viem";


export interface ContractConfig {
    address: Address;
    abi: Abi;
    chain: Chain
    events: string[];
    rpcUrl: string
  }