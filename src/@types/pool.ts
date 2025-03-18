import type { Address, PoolId, StakeKey } from './common'

export interface Pool {
  poolId: PoolId
  ticker: string
}

export interface Delegator {
  stakeKey: StakeKey
  address?: Address['address']
  delegatedLovelaces: number
}

export interface PoolDelegators {
  poolId: PoolId
  page: number
  delegators: Delegator[]
}
