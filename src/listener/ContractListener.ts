

import { Address, Chain, createPublicClient, webSocket } from "viem";

import { Abi, PublicClient } from "viem";
import { ContractConfig } from "../type";
import { mainnet } from "viem/chains";

export class ContractListener {
    private publicClient: PublicClient;
    private readonly abi: Abi;
    private readonly chain: Chain;
    private readonly contractAddress: Address;
    private readonly events: string[];
    private readonly rpcUrl: string;
    
    constructor(config: ContractConfig) {
      this.contractAddress = config.address;
      this.abi = config.abi;
      this.events = config.events;
      this.chain = config.chain;
      this.rpcUrl = config.rpcUrl;
      this.publicClient = createPublicClient({
        chain: this.chain,
        transport: webSocket(this.rpcUrl)
      });
    }
  
    private logEvent(logs: any): void {
      console.log(logs);
    }
  
    public watchEvents(): Map<string, () => void> {
      const unsubscribeFunctions = new Map<string, () => void>();
  
      this.events.forEach(eventName => {
        const unwatch = this.publicClient.watchContractEvent({
          address: this.contractAddress,
          abi: this.abi,
          eventName: eventName,
          onLogs: this.logEvent
        });
        unsubscribeFunctions.set(eventName, unwatch);
      });
  
      return unsubscribeFunctions;
    }
  
    public stopWatching(unsubscribeFunctions: Map<string, () => void>): void {
      unsubscribeFunctions.forEach((unwatch, eventName) => {
        unwatch();
        console.log(`Stopped watching ${eventName} for contract ${this.contractAddress}`);
      });
    }
  }
  