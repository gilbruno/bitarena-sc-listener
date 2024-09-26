import { Address } from 'viem';

import * as dotenv from "dotenv"
dotenv.config()

export const factoryAddress = process.env.ADDRESS_LAST_DEPLOYED_FACTORY as Address

export const adminChallenge = process.env.ADMIN_CHALLENGE as Address
export const adminDisputeChallenge = process.env.ADMIN_DISPUTE_CHALLENGE as Address