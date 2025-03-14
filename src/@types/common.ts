export type StakeKey = string
export type Address = {
  address: string
  isScript: boolean
}

export type PolicyId = string
export type TokenId = string
export type PoolId = string
export type TransactionId = string

export type OnScroll = (params: { clientHeight: number; scrollHeight: number; scrollTop: number }) => void
