export type StakeKey = string
export type Address = {
  address: string
  isScript: boolean
}

export type PolicyId = string
export type TokenId = string
export type PoolId = string
export type TransactionId = string

export type OnScrollParams = { isTop: boolean; isBottom: boolean; clientHeight: number; scrollHeight: number; scrollTop: number }
export type OnScroll = (params: OnScrollParams) => void

export interface FormRef<T = any> {
  getData: () => T
  validate: () => Promise<boolean>
}

export interface SnapshotHolder {
  stakeKey: StakeKey
  addresses: Address['address'][]
  assets: {
    [policyId: string]: {
      tokenId: string
      isFungible: boolean
      humanAmount: number
    }[]
  }
}

export interface PayoutRecipient {
  stakeKey: StakeKey
  address: Address['address']
  payout: number
  txHash?: string
  isDev?: boolean
}

export interface ProgressCounts {
  current: number
  max: number
}

export interface SnapshotProgressCounts {
  policy?: ProgressCounts
  token?: ProgressCounts
  holder?: ProgressCounts
  pool?: ProgressCounts
  delegator?: ProgressCounts
}

export interface PayoutProgressCounts {
  batch?: ProgressCounts
}
