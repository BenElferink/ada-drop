import axios from 'axios'
import { getQueryStringFromQueryOptions, retryAsync } from '@/functions'
import type { PolicyInfo, PoolInfo, PoolDelegators, PopulatedToken, TokenOwners, Transaction, Wallet, EpochInfo } from '@/@types'

class Api {
  baseUrl: string

  constructor() {
    this.baseUrl = '/api'
  }

  notify = (message: string, embed: string): Promise<void> => {
    const uri = `${this.baseUrl}/notify`

    return new Promise(async (resolve, reject) => {
      try {
        await axios.post(uri, { message, embed })

        return resolve()
      } catch (error) {
        return await retryAsync(error, async () => await this.epoch.getData(), reject)
      }
    })
  }

  epoch = {
    getData: (): Promise<EpochInfo> => {
      const uri = `${this.baseUrl}/epoch`

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<EpochInfo>(uri)

          return resolve(data)
        } catch (error) {
          return await retryAsync(error, async () => await this.epoch.getData(), reject)
        }
      })
    },
  }

  wallet = {
    getData: (
      walletId: string,
      queryOptions?: {
        withStakePool?: boolean
        withTokens?: boolean
        populateTokens?: boolean
      }
    ): Promise<Wallet> => {
      const uri = `${this.baseUrl}/wallet/${walletId}` + getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<Wallet>(uri)

          return resolve(data)
        } catch (error) {
          return await retryAsync(error, async () => await this.wallet.getData(walletId, queryOptions), reject)
        }
      })
    },
  }

  policy = {
    getData: (
      policyId: string,
      queryOptions?: {
        allTokens?: boolean
        withBurned?: boolean
        withRanks?: boolean
      }
    ): Promise<PolicyInfo> => {
      const uri = `${this.baseUrl}/policy/${policyId}` + getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<PolicyInfo>(uri)

          return resolve(data)
        } catch (error) {
          return await retryAsync(error, async () => await this.policy.getData(policyId, queryOptions), reject)
        }
      })
    },
  }

  token = {
    getData: (
      tokenId: string,
      queryOptions?: {
        populateMintTx?: boolean
      }
    ): Promise<PopulatedToken> => {
      const uri = `${this.baseUrl}/token/${tokenId}` + getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<PopulatedToken>(uri)

          return resolve(data)
        } catch (error) {
          return await retryAsync(error, async () => await this.token.getData(tokenId, queryOptions), reject)
        }
      })
    },
    getOwners: (
      tokenId: string,
      queryOptions?: {
        page?: number
      }
    ): Promise<TokenOwners> => {
      const uri = `${this.baseUrl}/token/${tokenId}/owners` + getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<TokenOwners>(uri)

          return resolve(data)
        } catch (error) {
          return await retryAsync(error, async () => await this.token.getOwners(tokenId, queryOptions), reject)
        }
      })
    },
  }

  stakePool = {
    getData: (poolId: string): Promise<PoolInfo> => {
      const uri = `${this.baseUrl}/pool/${poolId}`

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<PoolInfo>(uri)

          return resolve(data)
        } catch (error) {
          return await retryAsync(error, async () => await this.stakePool.getData(poolId), reject)
        }
      })
    },
    getDelegators: (
      poolId: string,
      queryOptions?: {
        page?: number
      }
    ): Promise<PoolDelegators> => {
      const uri = `${this.baseUrl}/pool/${poolId}/delegators` + getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<PoolDelegators>(uri)

          return resolve(data)
        } catch (error) {
          return await retryAsync(error, async () => await this.stakePool.getDelegators(poolId, queryOptions), reject)
        }
      })
    },
  }

  transaction = {
    getData: (
      transactionId: string,
      queryOptions?: {
        withUtxos?: boolean
      }
    ): Promise<Transaction> => {
      const uri = `${this.baseUrl}/transaction/${transactionId}` + getQueryStringFromQueryOptions(queryOptions)

      return new Promise(async (resolve, reject) => {
        try {
          const { data } = await axios.get<Transaction>(uri)

          return resolve(data)
        } catch (error) {
          return await retryAsync(error, async () => await this.transaction.getData(transactionId), reject)
        }
      })
    },
  }
}

const api = new Api()

export default api
