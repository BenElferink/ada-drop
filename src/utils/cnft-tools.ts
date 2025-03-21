import axios from 'axios'

interface FetchedExternal {
  assetID: string // '1'
  assetName: string // 'on-chain name'
  name: string // 'display name'
  encodedName: string // 'hex'
  iconurl: string // 'ips:// --> only the reference, no prefix'
  rarityRank: string // '1'
  ownerStakeKey: string // 'stake1...'
  onSale: boolean

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [lowercasedTraitCategory: string]: any // eyewear: '(U) 3D Glasses'
}

export interface CnftToolsPolicy {
  [tokentName: string]: string
}

export interface CnftToolsToken {
  assetId: string
  rank: number
  attributes: {
    [key: string]: string
  }
}

class CnftTools {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://api.cnft.tools/api'
  }

  getPolicyRanks = (policyId: string): Promise<CnftToolsPolicy | null> => {
    const uri = `${this.baseUrl}/rankings/${policyId}`

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get<CnftToolsPolicy>(uri, {
          headers: {
            'Accept-Encoding': 'application/json',
          },
        })

        return resolve(data)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error?.response?.data?.error === 'Policy ID not found') {
          return resolve(null)
        }

        return reject(error)
      }
    })
  }

  getTokens = (policyId: string): Promise<CnftToolsToken[] | null> => {
    const uri = `${this.baseUrl}/external/${policyId}`

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get<FetchedExternal[]>(uri, {
          headers: {
            'Accept-Encoding': 'application/json',
          },
        })

        const excludeKeysFromAttributes = ['assetID', 'assetName', 'name', 'encodedName', 'iconurl', 'rarityRank', 'ownerStakeKey', 'onSale']

        const payload = data
          .map((item) => {
            const attributes: Record<string, string> = {}

            Object.entries(item).forEach(([key, val]) => {
              if (!excludeKeysFromAttributes.includes(key)) {
                attributes[key] = val
              }
            })

            return {
              assetId: `${policyId}${item.encodedName}`,
              rank: Number(item.rarityRank),
              attributes,
            }
          })
          .sort((a, b) => a.rank - b.rank)

        return resolve(payload)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error?.response?.data?.error === 'Policy ID not found') {
          return resolve(null)
        }

        return reject(error)
      }
    })
  }
}

const cnftTools = new CnftTools()

export default cnftTools
