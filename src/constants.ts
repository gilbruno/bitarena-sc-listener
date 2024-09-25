import { Address } from 'viem';

import * as dotenv from "dotenv"
dotenv.config()

export const factoryAddress = process.env.ADDRESS_LAST_DEPLOYED_FACTORY as Address