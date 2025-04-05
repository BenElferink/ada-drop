import api from '@/utils/api'
import { sleep } from './sleep'
import type { Transaction } from '@/@types'

export const txConfirmation = async (_txHash: string): Promise<Transaction> => {
  try {
    const data = await api.transaction.getData(_txHash)

    if (data.block) {
      return data
    } else {
      await sleep(1000)
      return await txConfirmation(_txHash)
    }
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

    if (errMsg === `The requested component has not been found. ${_txHash}`) {
      await sleep(1000)
      return await txConfirmation(_txHash)
    } else {
      throw new Error(errMsg)
    }
  }
}
