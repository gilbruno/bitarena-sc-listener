import * as dotenv from "dotenv"
import { Log as customLog} from "./logger/log";
import { createPublicClient, http, Log, webSocket } from 'viem'
import { sepolia } from 'viem/chains'
import {factoryAbi} from './abi/BitarenaFactory' 
import { Address } from 'viem';
import { getChallengeByIndex } from "./utils/bitarenaUtils"


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
        const cLog       = new customLog()
        cLog.logger.info(`Listening Factory events on address ${factoryAddress}`)
        const unwatch = webSocketClient.watchContractEvent({
            address: factoryAddress,
            abi: factoryAbi,
            eventName: 'IntentChallengeCreation',
            onLogs: onIntentChallengeCreation
          })
          
    } catch (error) {
        console.error("Erreur lors de la création de l'abonnement :", error)
    }
}

const onIntentChallengeCreation = async (logs: Array<Log>) => {
    const cLog       = new customLog()
    cLog.logger.info(' > Challenge has been created !')
    for (const log of logs) {
        cLog.logger.info(`---- Factory Address: ${factoryAddress}`)
        cLog.logger.info(`---- Tx Hash: ${log.transactionHash}`)
        const challengeCounter = (log as any).args.challengeCounter
        cLog.logger.info(`---- challengeCounter: ${challengeCounter}`)
        const challengeStructCreated = await getChallengeByIndex(challengeCounter)
        cLog.logger.info(`---- created challenge : `)
        console.log(challengeStructCreated)
    }    
}

// Appeler la fonction pour écouter les événements
listenToContractEvents()
