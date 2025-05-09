import { Address, StakeKey, TransactionId } from '@/@types'
import axios from 'axios'

interface FetchedFarmer {
  walletAddress: Address['address']
  stakeAddress: StakeKey
  txHash: TransactionId
  lockedLpTokens: number
  startDate: string
  outputIndex: number
  tokensA: number // ADA (display value)
  tokensB: number // TICKER (display value)
}

class Cswap {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://api.cswap.trade'
  }

  getFarmers = (lpId: string): Promise<FetchedFarmer[]> => {
    const uri = `${this.baseUrl}/farming/farmers/${lpId}?format=json`

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get<FetchedFarmer[]>(uri)

        return resolve(data)
      } catch (error) {
        return reject(error)
      }
    })
  }
}

const cswap = new Cswap()

export default cswap
