

import { Address, Chain, createPublicClient, webSocket } from "viem";

import { Abi, PublicClient } from "viem";
import { ContractConfig } from "../type";
import { mainnet } from "viem/chains";
import logger from "../logger/log";

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

        logger.info(`Initialisation du ContractListener pour le contrat: ${this.contractAddress}`);
        logger.info(`Events surveillés: ${this.events.join(', ')}`);

        this.publicClient = createPublicClient({
            chain: this.chain,
            transport: webSocket(this.rpcUrl)
        });

        logger.info(`ContractListener initialisé sur la chaîne: ${this.chain.name}`);
    }
  
  
    /*
        Watch events on the contract
    */
    public watchEvents(options: { onLogs: (logs: any) => void }): Map<string, () => void> {
          const unsubscribeFunctions = new Map<string, () => void>();
          
          this.events.forEach(eventName => {
              logger.info(`Démarrage de la surveillance de l'événement '${eventName}' sur le contrat ${this.contractAddress}`);
      
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
        console.log(`Stopped watching ${eventName} for contract ${this.contractAddress}`);
      });

      logger.info(`Surveillance terminée pour tous les événements du contrat ${this.contractAddress}`);
    }
  }
  