import React, { type FC } from 'react'
import { ImageControlled, Tooltip } from '@odigos/ui-kit/components'
import type { PolicyId, StakeKey } from '@/@types'

interface KnownWalletProps {
  wallet?: string
}

interface KnownWallet {
  name: string
  description: string
  icon: string
  wallets: StakeKey[]
  lpTokens?: {
    forPolicyId: PolicyId
    cswap?: string
  }
}

export const knownWallets: KnownWallet[] = [
  {
    name: 'Levvy Lending',
    description: 'This airdrop was part of Levvy Lending monthly rewards program.',
    icon: '/assets/levvy.png',
    wallets: ['stake1uyu5665h73ly62ashkm88u3sexkjqg736ktndzvn7ufy2usyw6crz'],
    lpTokens: {
      forPolicyId: '285b65ae63d4fad36321384ec61edfd5187b8194fff89b5abe9876da',
      cswap: '48d5c66c1c29a86bb6e4f97fe418285eac39da91abac1c837fa88c86432d4c503a20414441207820414e47454c53',
    },
  },
]

export const KnownWallet: FC<KnownWalletProps> = ({ wallet }) => {
  const knownWallet = !!wallet && knownWallets.find((w) => w.wallets.includes(wallet))
  if (!knownWallet) return null

  return (
    <Tooltip title={knownWallet.name} text={knownWallet.description}>
      <ImageControlled src={knownWallet.icon} size={28} />
    </Tooltip>
  )
}
