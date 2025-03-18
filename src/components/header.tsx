import React from 'react'
import { TITLE } from '@/constants'
import { CardanoLogo } from '@/icons'
import { STATUS_TYPE } from '@odigos/ui-kit/types'
import { useChainLoad, useEpochInfo } from '@/hooks'
import { ConnectWallet, NewAirdrop } from '@/containers'
import { ToggleDarkMode } from '@odigos/ui-kit/containers'
import { Header as Container, Status, Text, Tooltip } from '@odigos/ui-kit/components'

const resolvePercentDisplay = (percent: number): string => `${percent.toFixed(1)}%`

export const Header = () => {
  const { epochInfo } = useEpochInfo()
  const { chainLoad, resolveChainLoadStatus } = useChainLoad()

  return (
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
            status={STATUS_TYPE.DEFAULT}
            title={`Epoch ${epochInfo.epoch}`}
            subtitle={resolvePercentDisplay(epochInfo.percent)}
            withBackground
          />
        </Tooltip>,
      ]}
      right={[<NewAirdrop key='new-airdrop' />, <ConnectWallet key='connect-wallet' />, <ToggleDarkMode key='toggle-theme' />]}
    />
  )
}
