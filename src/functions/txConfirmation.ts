import api from '@/utils/api'
import { sleep } from './sleep'
import type { Transaction } from '@/@types'

export const txConfirmation = async (_txHash: string): Promise<Transaction> => {
  try {
    const data = await api.transaction.getData(_txHash)

    if (data.block) {
      // success, let's wait a bit more to make sure the next tx in the batch is able to be processed
      await sleep(30000) // 30 seconds
      return data
    } else {
      // retry...
      // in theory this should never happen, only in catch block, but just in case
      await sleep(1000)
      return await txConfirmation(_txHash)
    }
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

    if (errMsg === `The requested component has not been found. ${_txHash}`) {
      // retry...
      await sleep(1000)
      return await txConfirmation(_txHash)
    } else {
      throw new Error(errMsg)
    }
  }
}
