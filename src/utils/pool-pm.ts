import axios from 'axios'

interface FetchedChainInformation {
  supply: number
  circulation: number
  delegations: number
  stake: number
  d: number
  k: number
  ADABTC: number
  ADAUSD: number
  ADAEUR: number
  ADAJPY: number
  ADAGBP: number
  ADACAD: number
  ADAAUD: number
  ADABRL: number
  tokens: number
  nfts: number
  nft_policies: number
  policies: number
  load_5m: number
  load_1h: number
  load_24h: number
}

class PoolPm {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://pool.pm'
  }

  getChainLoad = (): Promise<FetchedChainInformation> => {
    const uri = `${this.baseUrl}/total.json`

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get<FetchedChainInformation>(uri)

        return resolve(data)
      } catch (error) {
        return reject(error)
      }
    })
  }
}

const poolPm = new PoolPm()

export default poolPm
