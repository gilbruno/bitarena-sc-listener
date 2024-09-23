import { factoryAbi } from "../abi/BitarenaFactory"
import { publicClient } from "../config/clients"
import { factoryAddress } from "../constants"

export const getChallengeByIndex = async (index: number) => {

    const challengeStructCreated = await publicClient.readContract({
        address: factoryAddress,
        abi: factoryAbi,
        functionName: 'getChallengeByIndex',
        args: [index]
      })

    return challengeStructCreated
    


}