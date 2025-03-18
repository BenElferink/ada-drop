import type { TransactionId } from './common'

export interface Utxo {
  address: {
    from: string
    to: string
  }
  tokens: {
    tokenId: string
    tokenAmount: {
      onChain: number
    }
  }[]
}

export interface Transaction {
  transactionId: TransactionId
  block: string
  blockHeight: number
  utxos?: Utxo[]
}
