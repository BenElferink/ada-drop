import React, { type FC } from 'react'
import knownWallets from '@/data/known-wallets.json'
import { ImageControlled, Tooltip } from '@odigos/ui-kit/components'

interface KnownWalletProps {
  wallet?: string
}

export const KnownWallet: FC<KnownWalletProps> = ({ wallet }) => {
  const knownWallet = !!wallet && knownWallets.find((w) => w.wallets.includes(wallet))
  if (!knownWallet) return null

  return (
    <Tooltip title={knownWallet.name} text={knownWallet.description}>
      <ImageControlled src={knownWallet.icon} size={28} />
    </Tooltip>
  )
}
