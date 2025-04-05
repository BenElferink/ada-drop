import { ADA, MIN_LOVELACES_PER_WALLET } from '@/constants'
import type { PayoutRecipient } from '@/@types'
import { formatTokenAmountFromChain } from '@/functions'

export const verifyMinRequiredAda = (recipients: PayoutRecipient[], ownedLovelaces: number) => {
  // Cardano requires at least 1.2 ADA per TX.
  // This is because of the minimum lovelace requirement for the UTxO.

  const neededLovelaces = Math.ceil(recipients.length * MIN_LOVELACES_PER_WALLET)
  const missingLovelaces = neededLovelaces - ownedLovelaces

  return {
    isError: neededLovelaces > ownedLovelaces,

    neededLovelaces,
    ownedLovelaces,
    missingLovelaces,

    neededAda: formatTokenAmountFromChain(neededLovelaces, ADA['DECIMALS']),
    ownedAda: formatTokenAmountFromChain(ownedLovelaces, ADA['DECIMALS']),
    missingAda: formatTokenAmountFromChain(missingLovelaces, ADA['DECIMALS']),
  }
}
