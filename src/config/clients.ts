import * as dotenv from "dotenv"
import { Address, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";


dotenv.config()

const ALCHEMY_KEY=process.env.ALCHEMY_API_KEY



export const publicClient = createPublicClient({
    chain: sepolia, 
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`),
  })


export const adminFactoryAccount = privateKeyToAccount(`0x${process.env.ADMIN_FACTORY_PRIVATE_KEY}` as Address);

export const adminFactoryClient = createWalletClient({
    chain: sepolia,
    transport: http(),
    account: adminFactoryAccount
  });