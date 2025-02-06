

import { Address, Chain, createPublicClient, webSocket } from "viem";

import { Abi, PublicClient } from "viem";
import { ContractConfig } from "../types/types";
import {loggerWithTimestamp, loggerWithoutTimestamp} from "../logger/log";

export class ContractListener {
    private publicClient: PublicClient;
    private readonly abi: Abi;
    private readonly chain: Chain;
    private readonly contractAddress: Address;
    private readonly events: string[];
    private readonly rpcUrl: string;
    
    constructor(config: ContractConfig) {
        // Vérification que rpcUrl n'est pas vide
        if (!config.rpcUrl) {
            throw new Error('rpcUrl est requis dans la configuration du contrat');
        }
        this.contractAddress = config.address;
        this.abi = config.abi;
        this.events = config.events;
        this.chain = config.chain;
        this.rpcUrl = config.rpcUrl;

        loggerWithoutTimestamp.info(`************************************************************************`);
        loggerWithTimestamp.info(`*********** Initialisation du ContractListener pour le contrat: ${this.contractAddress} ***********`);
        loggerWithoutTimestamp.info(`     ------  Events surveillés: ${this.events.join(', ')}`);
        loggerWithoutTimestamp.info(`     ------  RPC URL: ${this.rpcUrl}`);
        loggerWithoutTimestamp.info(`     ------  Blockchain: ${this.chain.name}`);
        loggerWithoutTimestamp.info(`************************************************************************`);

        this.publicClient = createPublicClient({
            chain: this.chain,
            transport: webSocket(this.rpcUrl)
        });
    }
  
  
    /*
        Watch events on the contract
    */
    public watchEvents(options: { onLogs: (logs: any) => void }): Map<string, () => void> {
          const unsubscribeFunctions = new Map<string, () => void>();
          
          this.events.forEach(eventName => {
              loggerWithoutTimestamp.info(`  ----> Démarrage de la surveillance de l'événement '${eventName}' sur le contrat ${this.contractAddress}`);
      
              const unwatch = this.publicClient.watchContractEvent({
                  address: this.contractAddress,
                  abi: this.abi,
                  eventName: eventName,
                  onLogs: options.onLogs
              });
              unsubscribeFunctions.set(eventName, unwatch);
          });
      
          return unsubscribeFunctions;
      }

    /*
        Stop watching events
    */
    public stopWatching(unsubscribeFunctions: Map<string, () => void>): void {
      unsubscribeFunctions.forEach((unwatch, eventName) => {
        unwatch();
        loggerWithoutTimestamp.info(`Stopped watching ${eventName} for contract ${this.contractAddress}`);
      });

      loggerWithoutTimestamp.info(`Surveillance terminée pour tous les événements du contrat ${this.contractAddress}`);
    }
  }
  