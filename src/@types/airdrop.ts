import type { StakeKey, TokenId } from './common'
import type { TokenAmount, TokenName } from './token'

export interface TokenSelectionSettings {
  tokenId: TokenId
  tokenName: TokenName
  tokenAmount: TokenAmount
  thumb: string
}

export interface Airdrop extends TokenSelectionSettings {
  id: string
  stakeKey: StakeKey
  timestamp: number
  recipients?: {
    stakeKey: StakeKey
    txHash: string
    quantity: number
  }[]
}

export interface AirdropMonth {
  label: string
  airdropCount: number
  airdropIds: string[]
}
