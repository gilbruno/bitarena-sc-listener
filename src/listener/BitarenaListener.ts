import * as dotenv from "dotenv"
import { createPublicClient, http, Log, webSocket } from 'viem'
import { sepolia } from 'viem/chains'
import { Address } from 'viem'
import { getChallengeByIndex } from "../utils/bitarenaUtils"
import { CREATE_CHALLENGE_ABI, factoryAbi } from "../abi/BitarenaFactory"
import { adminChallenge, adminDisputeChallenge, factoryAddress } from "../constants"
import { Log as customLog} from "../logger/log"
import { adminFactoryAccount, adminFactoryClient, publicClient } from "../config/clients"

export class BitarenaSmartContractsEventListener {
    private factoryAddress: Address
    private alchemyKey: string | undefined
    private webSocketClient: ReturnType<typeof createPublicClient>
    private cLog: customLog

    constructor(factoryAddress: Address, alchemyKey: string, webSocketClient: ReturnType<typeof createPublicClient>) {
        this.factoryAddress = factoryAddress
        this.alchemyKey = alchemyKey
        this.webSocketClient = webSocketClient
        this.cLog = new customLog()
    }

    async listenToContractEvents() {
        try {
            if (!this.factoryAddress || !this.alchemyKey) {
                throw new Error('factoryAddress or ALCHEMY_KEY is not defined')
            }
            this.cLog.logger.info(`Listening Factory events on address ${this.factoryAddress}`)
            const unwatchIntentChallengeCreation = this.webSocketClient.watchContractEvent({
                address: this.factoryAddress,
                abi: factoryAbi,
                eventName: 'IntentChallengeCreation',
                onLogs: this.onIntentChallengeCreation
            })
            const unwatchChallengeDeployment = this.webSocketClient.watchContractEvent({
                address: this.factoryAddress,
                abi: factoryAbi,
                eventName: 'ChallengeDeployed',
                onLogs: this.onChallengeDeployment
            })

        } catch (error: any) {
            this.cLog.logger.error(`Error when subscribe to event : ${error.message}`)
        }
    }

    private async onIntentChallengeCreation(logs: Array<Log>) {
        const cLog = new customLog()
        cLog.logger.info(' > Challenge has been created !')
        for (const log of logs) {
            cLog.logger.info(`---- Factory Address: ${this.factoryAddress}`)
            cLog.logger.info(`---- Tx Hash: ${log.transactionHash}`)
            const challengeCounter = (log as any).args.challengeCounter
            cLog.logger.info(`---- challengeCounter: ${challengeCounter}`)
            const challengeStructCreated = await getChallengeByIndex(challengeCounter)
            cLog.logger.info(`---- created challenge : `)
            console.log(challengeStructCreated)
            cLog.logger.info(`---- deploy challenge ...`)
            // Get the last block infos
            const block = await publicClient.getBlock();
            const baseFeePerGas = block.baseFeePerGas as bigint;

            // const maxPriorityFeePerGas = 2n * 10n ** 9n;

            // const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;
            // const gas = await publicClient.estimateContractGas({
            //     address: factoryAddress,
            //     abi: CREATE_CHALLENGE_ABI,
            //     functionName: 'createChallenge',
            //     account: adminFactoryAccount
            //   })
            const {
                maxFeePerGas,
                maxPriorityFeePerGas
              } = await publicClient.estimateFeesPerGas()

            // const maxPriorityFeePerGas = await publicClient.estimateMaxPriorityFeePerGas()  
            // await publicClient.estimate
            
            await adminFactoryClient.writeContract({
                address: factoryAddress,
                abi: factoryAbi,
                functionName: 'createChallenge',
                args: [adminChallenge as Address, adminDisputeChallenge as Address, challengeCounter],
                account: adminFactoryAccount,
                maxFeePerGas: maxFeePerGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas + maxPriorityFeePerGas,
                //gas: gas
            })
            //await this.deployNewChallenge(challengeCounter)
            cLog.logger.info(`---- deploy challenge end `)
        }
    }

    private async onChallengeDeployment(logs: Array<Log>) {
        const cLog = new customLog()
        cLog.logger.info(' > Challenge has been deployed !')
        for (const log of logs) {
            cLog.logger.info(`---- Tx Hash: ${log.transactionHash}`)
            const challengeCounter = (log as any).args.challengeCounter
            const challengeAddress = (log as any).args.challengeAddress
            cLog.logger.info(`---- challengeCounter: ${challengeCounter}`)
            const challengeStructCreated = await getChallengeByIndex(challengeCounter)
            cLog.logger.info(`---- created challenge : `)
            console.log(challengeStructCreated)
            cLog.logger.info(`---- challengeAddress: ${challengeAddress}`)
        }
    }

    /**
     * When a challenge creator send a blockchain Tx to intent to create a challenge
     * The listener intercepts the event "IntentChallengeCreation" then the FACTORY_ADMIN must deploy the new challenge
     * 
     */
    private async deployNewChallenge(challengeIndex: number) {
        await adminFactoryClient.writeContract({
            address: factoryAddress,
            abi: factoryAbi,
            functionName: 'createChallenge',
            args: [adminChallenge as Address, adminDisputeChallenge as Address, challengeIndex],
            account: adminFactoryAccount,
        })
    }

}