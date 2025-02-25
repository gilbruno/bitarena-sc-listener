

import { Address, Chain, createPublicClient, http, webSocket } from "viem";

import { Abi, PublicClient } from "viem";
import { ContractConfig } from "../types/types";
import {loggerWithTimestamp, loggerWithoutTimestamp} from "../logger/log";

export class ContractListener {
    private publicClient: PublicClient;
    private httpClient: PublicClient;
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
            transport: webSocket(this.rpcUrl, {
                // Add reconnection options
                retryCount: 5,
                retryDelay: 1000,
                timeout: 60000
            })
        });

         // Add a backup HTTP client
         this.httpClient = createPublicClient({
            chain: this.chain,
            transport: http(config.httpRpcUrl || this.rpcUrl.replace('wss://', 'https://'))
        });
    }
  
  
    /*
        Watch events on the contract
    */
    public watchEvents(options: { onLogs: (logs: any) => void }): Map<string, () => void> {
          const unsubscribeFunctions = new Map<string, () => void>();

          // Keep track of the last checked block
        let lastCheckedBlock = 0;
          
          this.events.forEach(eventName => {
              loggerWithoutTimestamp.info(`  ----> Démarrage de la surveillance de l'événement '${eventName}' sur le contrat ${this.contractAddress}`);
      
              const unwatch = this.publicClient.watchContractEvent({
                  address: this.contractAddress,
                  abi: this.abi,
                  eventName: eventName,
                  onLogs: options.onLogs
              });

              // Add a periodic check for recent events
              // to catch those that the WebSocket might have missed
            const checkInterval = setInterval(async () => {
                try {
                    // Get the current block
                    const currentBlock = await this.publicClient.getBlockNumber();
                    
                    // If this is our first check, start from the current block
                    if (lastCheckedBlock === 0) {
                        lastCheckedBlock = Number(currentBlock);
                        return;
                    }
                    
                    // Check events since the last checked block
                    if (currentBlock > lastCheckedBlock) {
                        const logs = await this.publicClient.getContractEvents({
                            address: this.contractAddress,
                            abi: this.abi,
                            eventName: eventName,
                            fromBlock: BigInt(lastCheckedBlock + 1),
                            toBlock: BigInt(currentBlock)
                        });
                        
                        if (logs.length > 0) {
                            options.onLogs(logs);
                        }
                        
                        lastCheckedBlock = Number(currentBlock);
                    }
                } catch (error) {
                    loggerWithoutTimestamp.error(`Erreur lors de la vérification des événements: ${error}`);
                }
            }, 15000); 

            // Store the two stop functions
            unsubscribeFunctions.set(eventName, () => {
                unwatch();
                clearInterval(checkInterval);
            });

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
  