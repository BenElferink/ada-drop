import type { StakeKey, TransactionId } from './common'
import type { TokenSelectionSettings } from './settings'

// as-is in database
export interface Airdrop extends TokenSelectionSettings {
  id?: string
  timestamp: number
  stakeKey: StakeKey
  recipients?: {
    stakeKey: StakeKey
    txHash: string
    quantity: number
  }[]
}

// for mapping into store
export interface AirdropMonth {
  timestamp: number
  label: string
  airdropCount: number
}

// for mapping into store
export interface AirdropTransaction extends TokenSelectionSettings {
  timestamp: number
  airdropId: string
  txHash: TransactionId
  recipientCount: number
}

// for mapping into store
export interface AirdropRicipent extends TokenSelectionSettings {
  timestamp: number
  airdropId: string
  txHash: TransactionId
  stakeKey: StakeKey
}
