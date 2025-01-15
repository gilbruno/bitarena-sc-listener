export interface ContractConfig {
    address: string;
    events: string[];
    abi: any
}

export interface BlockchainConfig {
    wsUrl: string;
    contracts: ContractConfig[];
}


