import type { Address, PolicyId, StakeKey, TokenId } from './common'

export interface TokenAmount {
  onChain: number
  decimals: number
  display: number
}

export interface TokenName {
  onChain: string
  ticker: string
  display: string
}

export interface BaseToken {
  tokenId: TokenId
  isFungible: boolean
  tokenAmount: TokenAmount
  tokenName?: TokenName
}

export interface RankedToken extends BaseToken {
  rarityRank?: number
}

export interface PopulatedToken extends RankedToken {
  fingerprint: string
  policyId: PolicyId
  serialNumber?: number
  mintTransactionId: string
  mintBlockHeight?: number
  image: {
    ipfs: string
    url: string
  }
  files: {
    src: string
    mediaType: string
    name: string
  }[]
  attributes: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

export interface Owner {
  quantity: number // on-chain value (if using decimals)
  stakeKey: StakeKey
  addresses: Address[]
}

export interface TokenOwners {
  tokenId: TokenId
  page: number
  owners: Owner[]
}
