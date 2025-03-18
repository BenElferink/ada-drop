import type { BaseToken, PopulatedToken } from './token'
import type { Address, PoolId, StakeKey } from './common'

export interface Wallet {
  stakeKey: StakeKey
  addresses: Address[]
  poolId?: PoolId
  handles?: string[]
  tokens?: BaseToken[] | PopulatedToken[]
}
