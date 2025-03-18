import type { TokenAmount, TokenName } from './token'
import type { PolicyId, PoolId, StakeKey, TokenId } from './common'

export interface TokenSelectionSettings {
  tokenId: TokenId
  tokenName: TokenName
  tokenAmount: TokenAmount
  thumb: string
}

export interface HolderSettings {
  withHolders: boolean
  holderPolicies: {
    policyId: PolicyId
    hasFungibleTokens?: boolean
    weight: number

    withTraits?: boolean
    traitOptions?: {
      category: string
      trait: string
      amount: number
    }[]

    withRanks?: boolean
    rankOptions?: {
      minRange: number
      maxRange: number
      amount: number
    }[]

    withWhales?: boolean
    whaleOptions?: {
      shouldStack: boolean
      groupSize: number
      amount: number
    }[]
  }[]
}

export interface DelegatorSettings {
  withDelegators: boolean
  stakePools: PoolId[]
}

export interface BlacklistSettings {
  withBlacklist: boolean
  blacklistWallets: StakeKey[]
  blacklistTokens: TokenId[]
}

export interface AirdropSettings extends TokenSelectionSettings, HolderSettings, DelegatorSettings, BlacklistSettings {
  airdropMethod: 'none' | 'holder-snapshot' | 'delegator-snapshot' | 'custom-list'
}
