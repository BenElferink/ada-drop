import axios from 'axios'

interface FetchedTokenMetadataValueObject {
  signatures: {
    publicKey: string
    signature: string
  }[]
  sequenceNumber: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
}

interface FetchedTokenMetadata {
  subject: string // policyId + toHex(assetOnChainName)
  policy: string
  url?: FetchedTokenMetadataValueObject
  decimals?: FetchedTokenMetadataValueObject
  ticker?: FetchedTokenMetadataValueObject
  name?: FetchedTokenMetadataValueObject
  logo?: FetchedTokenMetadataValueObject
  description?: FetchedTokenMetadataValueObject
}

interface TokenMetadata {
  ticker: string
  decimals: number
}

class CardanoTokenRegistry {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://tokens.cardano.org'
  }

  getTokenInformation = (assetId: string): Promise<TokenMetadata> => {
    const uri = `${this.baseUrl}/metadata/${assetId}`

    return new Promise(async (resolve, reject) => {
      try {
        console.log('Fetching token metadata:', assetId)

        const { data } = await axios.get<FetchedTokenMetadata>(uri, {
          headers: {
            'Accept-Encoding': 'application/json',
          },
        })

        const payload = {
          ticker: String(data.ticker?.value || ''),
          decimals: Number(data.decimals?.value || 0),
        }

        console.log('Fetched token metadata:', payload)

        return resolve(payload)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return resolve({
            ticker: '',
            decimals: 0,
          })
        }

        return reject(error)
      }
    })
  }
}

const cardanoTokenRegistry = new CardanoTokenRegistry()

export default cardanoTokenRegistry
