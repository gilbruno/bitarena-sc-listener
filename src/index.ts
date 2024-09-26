import * as dotenv from "dotenv"
import { Log as customLog} from "./logger/log"
import { createPublicClient, http, Log, webSocket } from 'viem'
import { sepolia } from 'viem/chains'
import {factoryAbi} from './abi/BitarenaFactory' 
import { Address } from 'viem'
import { getChallengeByIndex } from "./utils/bitarenaUtils"
import { adminFactoryAccount, adminFactoryClient } from "./config/clients"
import { adminChallenge, adminDisputeChallenge } from "./constants"
import { BitarenaSmartContractsEventListener } from "./listener/BitarenaListener"


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
// async function listenToContractEvents() {
//     const cLog       = new customLog()
//     try {
//         if (!factoryAddress || !ALCHEMY_KEY) {
//             throw new Error('factoryAddress or ALCHEMY_KEY is not defined')
//         }
//         cLog.logger.info(`Listening Factory events on address ${factoryAddress}`)
//         const unwatchIntentChallengeCreation = webSocketClient.watchContractEvent({
//             address: factoryAddress,
//             abi: factoryAbi,
//             eventName: 'IntentChallengeCreation',
//             onLogs: onIntentChallengeCreation
//           })
//         const unwatchChallengeDeployment = webSocketClient.watchContractEvent({
//             address: factoryAddress,
//             abi: factoryAbi,
//             eventName: 'ChallengeDeployed',
//             onLogs: onChallengeDeployment
//           })
          
//     } catch (error: any) {
//         cLog.logger.error(`Error when subscribe to event : ${error.message}`)
//     }
// }

/**
 * Callback called when a event 'IntentChallengeCreation' is emitted
 * @param logs 
 */
// const onIntentChallengeCreation = async (logs: Array<Log>) => {
//     const cLog       = new customLog()
//     cLog.logger.info(' > Challenge has been created !')
//     for (const log of logs) {
//         cLog.logger.info(`---- Factory Address: ${factoryAddress}`)
//         cLog.logger.info(`---- Tx Hash: ${log.transactionHash}`)
//         const challengeCounter = (log as any).args.challengeCounter
//         cLog.logger.info(`---- challengeCounter: ${challengeCounter}`)
//         const challengeStructCreated = await getChallengeByIndex(challengeCounter)
//         cLog.logger.info(`---- created challenge : `)
//         console.log(challengeStructCreated)
//         await deployNewChallenge(challengeCounter)
//     }    
// }

/**
 * When a challenge creator send a blockchain Tx to intent to create a challenge
 * The listener intercepts the event "IntentChallengeCreation" then the FACTORY_ADMIN must deploy the new challenge
 * 
 */
// const deployNewChallenge = async (challengeIndex: number) => {
//     await adminFactoryClient.writeContract({
//         address: factoryAddress,
//         abi: factoryAbi,
//         functionName: 'createChallenge',
//         args: [adminChallenge as Address, adminDisputeChallenge as Address, challengeIndex],
//         account: adminFactoryAccount,
//       })
// }

/**
 * Callback called when a event 'ChallengeDeployed' is emitted
 * @param logs 
 */
// const onChallengeDeployment = async (logs: Array<Log>) => {
//     const cLog       = new customLog()
//     cLog.logger.info(' > Challenge has been deployed !')
//     for (const log of logs) {
//         cLog.logger.info(`---- Factory Address: ${factoryAddress}`)
//         cLog.logger.info(`---- Tx Hash: ${log.transactionHash}`)
//         const challengeCounter = (log as any).args.challengeCounter
//         const challengeAddress = (log as any).args.challengeAddress
//         cLog.logger.info(`---- challengeCounter: ${challengeCounter}`)
//         cLog.logger.info(`---- challengeAddress: ${challengeAddress}`)
//     }    
// }

// Appeler la fonction pour écouter les événements
// listenToContractEvents()




const contractEventListener = new BitarenaSmartContractsEventListener(factoryAddress, ALCHEMY_KEY as string, webSocketClient);
contractEventListener.listenToContractEvents();