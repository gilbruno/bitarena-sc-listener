/*
import * as dotenv from "dotenv"
import { createPublicClient, http, Log, webSocket } from 'viem'
import {factoryAbi} from './abi/BitarenaFactory' 

import { publicClient } from "./config/clients"
import { Log as customLog} from "./logger/log";
import { factoryAddress } from "./constants";
import { getChallengeByIndex } from "./utils/bitarenaUtils";


dotenv.config()

// Fonction pour écouter les événements du smart contract
async function listenToContractEvents() {
    try {
        const cLog       = new customLog()
        cLog.logger.info(`Listening Factory events on address ${factoryAddress}`)
        const unwatch = publicClient.watchContractEvent({
            address: factoryAddress,
            abi: factoryAbi,
            eventName: 'IntentChallengeCreation',
            onLogs: async (logs) => {
                console.log('Challenge has been created !')
                const cLog       = new customLog()
                for (const log of logs) {
                    console.log('---- Log Index: ' + log.logIndex)
                    console.log('---- Log Tx Hash: ' + log.transactionHash)
                    console.log('---- Log Tx Index: ' + log.transactionIndex)
                    const challengeCounter = (log as any).args.challengeCounter
                    console.log('-------- challengeCounter: ' + (log as any).args.challengeCounter)

                    const challengeStructCreated = getChallengeByIndex(challengeCounter)
                    cLog.logger.info(challengeStructCreated)
                }    
            }    

          })
          
    } catch (error) {
        console.error("Erreur lors de la création de l'abonnement :", error)
    }
}

const onIntentChallengeCreation = async (logs: Array<Log>) => {
    console.log('Challenge has been created !')
    const cLog       = new customLog()
    for (const log of logs) {
        console.log('---- Log Index: ' + log.logIndex)
        console.log('---- Log Tx Hash: ' + log.transactionHash)
        console.log('---- Log Tx Index: ' + log.transactionIndex)
        const challengeCounter = (log as any).args.challengeCounter
        console.log('-------- challengeCounter: ' + (log as any).args.challengeCounter)

        const challengeStructCreated = getChallengeByIndex(challengeCounter)
        cLog.logger.info(challengeStructCreated)
    }
}


// Appeler la fonction pour écouter les événements
listenToContractEvents()
*/

import * as dotenv from "dotenv"
import { Log } from "./logger/log"
import { createPublicClient, http, webSocket } from 'viem'
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
                    const challengeCounter = (log as any).args.challengeCounter
                    console.log('-------- challengeCounter: ' + challengeCounter)
                    const challengeStructCreated = await getChallengeByIndex(challengeCounter)
                    console.log(challengeStructCreated)
                }    
            }    
          })
          
    } catch (error) {
        console.error("Erreur lors de la création de l'abonnement :", error)
    }
}


// Appeler la fonction pour écouter les événements
listenToContractEvents()
