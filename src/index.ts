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

const contractEventListener = new BitarenaSmartContractsEventListener(factoryAddress, ALCHEMY_KEY as string, webSocketClient);
contractEventListener.listenToContractEvents();