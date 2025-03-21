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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormRef<T = any> {
  data: T
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
  forceLovelace?: boolean // this is for dev fees
}
