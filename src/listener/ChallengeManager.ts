import { ContractListener } from "./ContractListener";
import { ContractConfig } from "../type";
import { Address, Abi, Chain } from "viem";
import {loggerWithTimestamp, loggerWithoutTimestamp} from "../logger/log";

export class ChallengeManager {
    private activeListeners: Map<Address, ContractListener>;
    private activeUnwatchFunctions: Map<Address, Map<string, () => void>>;
    private readonly childContractAbi: Abi;
    private readonly chain: Chain;
    private readonly rpcUrl: string;

    constructor(childContractAbi: Abi, chain: Chain, rpcUrl: string) {
        this.activeListeners = new Map();
        this.activeUnwatchFunctions = new Map();
        this.childContractAbi = childContractAbi;
        this.chain = chain;
        this.rpcUrl = rpcUrl;

        loggerWithoutTimestamp.info('Initialisation du ChildContractManager');
    }

    /*
        Log event
    */
    private logEvent(logs: any): void {
        if (logs[0].eventName === 'PlayerJoinsTeam') {
            const teamIndex = logs[0].args.teamIndex;
            const player = logs[0].args.player;
            loggerWithoutTimestamp.info(`Nouveau joueur ${player} a rejoint l'équipe ${teamIndex}`);
        } else if (logs[0].eventName === 'PoolChallengeWithdrawed') {
            const contractAddress = logs[0].address;
            this.stopListener(contractAddress);
            loggerWithoutTimestamp.info(`Challenge ${contractAddress} terminé - Arrêt de l'écoute`);
        }
    }

    
    /*
        Create a listener for a Bitarena Challenge
    */
    public createListener(childAddress: Address): void {
        if (this.activeListeners.has(childAddress)) {
            loggerWithoutTimestamp.info(`Listener déjà existant pour le contrat ${childAddress}`);
            return;
        }

        const config: ContractConfig = {
            address: childAddress,
            abi: this.childContractAbi,
            chain: this.chain,
            events: ['PlayerJoinsTeam'],
            rpcUrl: this.rpcUrl
        };

        const listener = new ContractListener(config);
        const unwatchFunctions = listener.watchEvents({ onLogs: this.logEvent });
        this.activeUnwatchFunctions.set(childAddress, unwatchFunctions);

        this.activeListeners.set(childAddress, listener);
        loggerWithoutTimestamp.info(`Nouveau listener créé pour le contrat ${childAddress}`);
    }

    public stopListener(childAddress: Address): void {
        const listener = this.activeListeners.get(childAddress);
        const unwatchFunctions = this.activeUnwatchFunctions.get(childAddress);
        if (listener && unwatchFunctions) {
            listener.stopWatching(unwatchFunctions);
            this.activeListeners.delete(childAddress);
            this.activeUnwatchFunctions.delete(childAddress);
            loggerWithoutTimestamp.info(`Listener arrêté pour le contrat ${childAddress}`);
        }
    }

    public stopAllListeners(): void {
        this.activeListeners.forEach((listener, address) => {
            this.stopListener(address);
        });
        loggerWithoutTimestamp.info('Tous les listeners ont été arrêtés');
    }
}
