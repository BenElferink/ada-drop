import React, { type FC } from 'react'
import { ImageControlled, Tooltip } from '@odigos/ui-kit/components'

interface KnownWallet {
  wallets: string[]
  name: string
  description: string
  icon: string
  // website: string
}

interface KnownWalletProps {
  wallet?: string
}

const data: KnownWallet[] = [
  {
    wallets: ['stake1uyu5665h73ly62ashkm88u3sexkjqg736ktndzvn7ufy2usyw6crz'],
    name: 'Levvy Lending',
    description: 'This airdrop was part of Levvy Lending monthly rewards program.',
    icon: '/assets/levvy.png',
    // website: 'https://levvy.fi'
  },
]

export const KnownWallet: FC<KnownWalletProps> = ({ wallet }) => {
  const knownWallet = !!wallet && data.find((w) => w.wallets.includes(wallet))
  if (!knownWallet) return null

  return (
    <Tooltip title={knownWallet.name} text={knownWallet.description}>
      <ImageControlled src={knownWallet.icon} size={28} />
    </Tooltip>
  )
}
