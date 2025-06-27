import React from 'react'
import { TITLE } from '@/constants'
import { CardanoLogo } from '@/icons'
import { SocialIcon } from './social-icon'
import { MeshProvider } from '@meshsdk/react'
import { StatusType } from '@odigos/ui-kit/types'
import { useDarkMode } from '@odigos/ui-kit/store'
import { useChainLoad, useEpochInfo } from '@/hooks'
import { ConnectWallet, NewAirdrop } from '@/containers'
import { ToggleDarkMode } from '@odigos/ui-kit/containers'
import { Header as Container, Status, Text, Tooltip } from '@odigos/ui-kit/components'

const resolvePercentDisplay = (percent: number): string => `${percent.toFixed(1)}%`

export const Header = () => {
  const { darkMode } = useDarkMode()
  const { epochInfo } = useEpochInfo()
  const { chainLoad, resolveChainLoadStatus } = useChainLoad()

  return (
    <MeshProvider>
      <Container
        left={[
          <CardanoLogo key='logo' size={50} />,
          <Text key='title' family='secondary' size={20}>
            {TITLE}
          </Text>,
          <Tooltip key='chain-load-5m' text='Cardano Chain Load'>
            <Status
              status={resolveChainLoadStatus(chainLoad.load5m)}
              title='5m'
              subtitle={resolvePercentDisplay(chainLoad.load5m)}
              withIcon
              withBackground
            />
          </Tooltip>,
          <Tooltip key='chain-load-1h' text='Cardano Chain Load'>
            <Status
              status={resolveChainLoadStatus(chainLoad.load1h)}
              title='1h'
              subtitle={resolvePercentDisplay(chainLoad.load1h)}
              withIcon
              withBackground
            />
          </Tooltip>,
          <Tooltip key='chain-load-24h' text='Cardano Chain Load'>
            <Status
              status={resolveChainLoadStatus(chainLoad.load24h)}
              title='24h'
              subtitle={resolvePercentDisplay(chainLoad.load24h)}
              withIcon
              withBackground
            />
          </Tooltip>,
          <Tooltip key='epoch' text='Cardano Epoch Progress'>
            <Status
              status={StatusType.Default}
              title={`Epoch ${epochInfo.epoch}`}
              subtitle={resolvePercentDisplay(epochInfo.percent)}
              withBackground
            />
          </Tooltip>,
        ]}
        right={[
          <SocialIcon key='social-twitter' network='twitter' url='https://x.com/intent/follow?screen_name=CardanoAirdrops' />,
          <SocialIcon key='social-discord' url='https://discord.gg/H72xVv7fHd' />,
          <SocialIcon key='social-github' url='https://github.com/BenElferink/ada-drop' />,
          <NewAirdrop key='new-airdrop' />,
          <ConnectWallet key='connect-wallet' />,
          <ToggleDarkMode key='toggle-theme' />,
        ]}
      />
    </MeshProvider>
  )
}
