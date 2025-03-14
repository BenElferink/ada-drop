import type { TokenAmount, TokenName } from './token'
import type { StakeKey, TokenId, TransactionId } from './common'

export interface TokenSelectionSettings {
  tokenId: TokenId
  tokenName: TokenName
  tokenAmount: TokenAmount
  thumb: string
}

export interface Airdrop extends TokenSelectionSettings {
  id: string
  timestamp: number
  stakeKey: StakeKey
  recipients?: {
    stakeKey: StakeKey
    txHash: string
    quantity: number
  }[]
}

export interface AirdropMonth {
  timestamp: number
  label: string
  airdropCount: number
}

export interface AirdropTransaction extends TokenSelectionSettings {
  timestamp: number
  airdropId: string
  txHash: TransactionId
  recipientCount: number
}

export interface AirdropRicipent extends TokenSelectionSettings {
  timestamp: number
  airdropId: string
  txHash: TransactionId
  stakeKey: StakeKey
}
