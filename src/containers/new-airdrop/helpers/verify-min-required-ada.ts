import { ADA } from '@/constants'
import type { PayoutRecipient } from '@/@types'
import { formatTokenAmountFromChain, formatTokenAmountToChain } from '@/functions'

export const verifyMinRequiredAda = (recipients: PayoutRecipient[], ownedLovelaces: number, isLovelaces: boolean) => {
  // Cardano requires at least 1 ADA per TX.
  // But when sending tokens, the minimum is estimated at 1.2 ADA per TX.
  // This is because of the minimum lovelace requirement for the UTxO.

  const minLovelacesPerWallet = formatTokenAmountToChain(isLovelaces ? 1 : 1.2, ADA['DECIMALS'])
  const neededLovelaces = Math.ceil(recipients.length * minLovelacesPerWallet)
  const missingLovelaces = neededLovelaces - ownedLovelaces

  return {
    isError: neededLovelaces > ownedLovelaces,

    neededLovelaces,
    ownedLovelaces,
    missingLovelaces,
    minLovelacesPerWallet,

    neededAda: formatTokenAmountFromChain(neededLovelaces, ADA['DECIMALS']),
    ownedAda: formatTokenAmountFromChain(ownedLovelaces, ADA['DECIMALS']),
    missingAda: formatTokenAmountFromChain(missingLovelaces, ADA['DECIMALS']),
    minAdaPerWallet: formatTokenAmountFromChain(minLovelacesPerWallet, ADA['DECIMALS']),
  }
}
