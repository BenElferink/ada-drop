import type { BaseToken, PopulatedToken } from './token'
import type { Address, PolicyId, PoolId, StakeKey } from './common'

export interface Wallet {
  stakeKey: StakeKey
  addresses: Address[]
  poolId?: PoolId
  handles?: string[]
  tokens?: BaseToken[] | PopulatedToken[]
}

export interface KnownWallet {
  name: string
  description: string
  icon: string
  wallets: StakeKey[]
  lpTokens?: {
    forPolicyId: PolicyId
    cswap?: string
  }
}
