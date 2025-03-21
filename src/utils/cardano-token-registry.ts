import axios from 'axios'

interface FetchedTokenMetadataValueObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  sequenceNumber: number
  signatures: {
    publicKey: string
    signature: string
  }[]
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

class CardanoTokenRegistry {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://tokens.cardano.org'
  }

  getTokenInformation = (assetId: string): Promise<FetchedTokenMetadata> => {
    const uri = `${this.baseUrl}/metadata/${assetId}`

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get<FetchedTokenMetadata>(uri, {
          headers: {
            'Accept-Encoding': 'application/json',
          },
        })

        return resolve(data)
      } catch (error) {
        return reject(error)
      }
    })
  }
}

const cardanoTokenRegistry = new CardanoTokenRegistry()

export default cardanoTokenRegistry
