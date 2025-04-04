import type { PayoutRecipient, PopulatedToken, TokenId } from '@/@types'

export const verifyMinRequiredBalance = (recipients: PayoutRecipient[], tokens: PopulatedToken[], tokenId: TokenId) => {
  // on chain amounts

  const neededBalance = recipients.reduce((prev, curr) => (!curr.payout ? prev : prev + curr.payout), 0)
  const ownedBalance = tokens.find((t) => t.tokenId === tokenId)?.tokenAmount.onChain || 0
  const missingBalance = neededBalance - ownedBalance

  return {
    isError: neededBalance > ownedBalance,

    neededBalance,
    ownedBalance,
    missingBalance,
  }
}
