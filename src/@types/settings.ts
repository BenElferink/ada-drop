import type { TokenAmount, TokenName } from './token'
import type { PolicyId, PoolId, StakeKey, TokenId } from './common'

export enum AirdropMethodType {
  EMPTY = '',
  HolderSnapshot = 'Holder Snapshot',
  DelegatorSnapshot = 'Delegator Snapshot',
  CustomList = 'Custom List',
}

export interface TokenSelectionSettings {
  tokenId: TokenId
  tokenName: TokenName
  tokenAmount: TokenAmount
  thumb: string
}

export interface PolicyTraitOptions {
  category: string
  trait: string
  amount: number
}

export interface PolicyRankOptions {
  minRange: number
  maxRange: number
  amount: number
}

export interface PolicyWhaleOptions {
  shouldStack: boolean
  groupSize: number
  amount: number
}

export interface PolicySettings {
  policies: {
    policyId: PolicyId
    weight: number

    withTraits?: boolean
    traitOptions?: PolicyTraitOptions[]

    withRanks?: boolean
    rankOptions?: PolicyRankOptions[]

    withWhales?: boolean
    whaleOptions?: PolicyWhaleOptions[]
  }[]
}

export interface DelegatorSettings {
  stakePools: PoolId[]
}

export interface BlacklistSettings {
  blacklistWallets: StakeKey[]
  blacklistTokens: TokenId[]
}

export interface AirdropSettings extends TokenSelectionSettings, PolicySettings, DelegatorSettings, BlacklistSettings {
  airdropMethod: AirdropMethodType
}

// export interface HolderAirdrop extends TokenSelectionSettings, PolicySettings, BlacklistSettings {}
// export interface DelegatorAirdrop extends TokenSelectionSettings, DelegatorSettings, BlacklistSettings {}
// export interface CustomListAirdrop extends TokenSelectionSettings, BlacklistSettings {}
