import * as dotenv from "dotenv"
import { Log } from "./logger/log"
import { createPublicClient, http, webSocket } from 'viem'
import { sepolia } from 'viem/chains'
import {factoryAbi} from './abi/BitarenaFactory' 
import { Address } from 'viem';


dotenv.config()

// Adresse du smart contract
const factoryAddress = process.env.ADDRESS_LAST_DEPLOYED_FACTORY as Address


const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY
// Créer un client public avec le fournisseur WebSocket
const webSocketClient = createPublicClient({
    chain: sepolia, 
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`)
  })


// Fonction pour écouter les événements du smart contract
async function listenToContractEvents() {
    try {
        const customLog       = new Log()
        customLog.logger.info(`Listening Factory events on address ${factoryAddress}`)
        const unwatch = webSocketClient.watchContractEvent({
            address: factoryAddress,
            abi: factoryAbi,
            eventName: 'IntentChallengeCreation',
            onLogs: async (logs) => {
                console.log('Challenge has been created !')
                for (const log of logs) {
                    console.log('---- Log Index: ' + log.logIndex)
                    console.log('---- Log Tx Hash: ' + log.transactionHash)
                    console.log('---- Log Tx Index: ' + log.transactionIndex)
                    console.log('-------- challengeCounter: ' + (log as any).args.challengeCounter)
                }    
            }    
          })
          
    } catch (error) {
        console.error("Erreur lors de la création de l'abonnement :", error)
    }
}


// Appeler la fonction pour écouter les événements
listenToContractEvents()
