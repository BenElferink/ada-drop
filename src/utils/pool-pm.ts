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

interface ChainLoad {
  load5m: number
  load1h: number
  load24h: number
}

class PoolPm {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://pool.pm'
  }

  getChainLoad = (): Promise<ChainLoad> => {
    const uri = `${this.baseUrl}/total.json`

    return new Promise(async (resolve, reject) => {
      try {
        console.log('Fetching chain load')

        const { data } = await axios.get<FetchedChainInformation>(uri)

        const payload = {
          load5m: data.load_5m * 100,
          load1h: data.load_1h * 100,
          load24h: data.load_24h * 100,
        }

        console.log('Fetched chain load:', payload)

        return resolve(payload)
      } catch (error) {
        return reject(error)
      }
    })
  }
}

const poolPm = new PoolPm()

export default poolPm
