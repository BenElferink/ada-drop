import React, { useEffect, useState } from 'react'
import api from '@/utils/api'
import poolPm from '@/utils/pool-pm'
import Theme from '@odigos/ui-theme'
import { NOTIFICATION_TYPE } from '@odigos/ui-utils'
import { Header as Container, Status, Text, Tooltip } from '@odigos/ui-components'
import { TITLE } from '@/constants'
import CardanoLogo from './cardano-logo'

const getChainLoadStatus = (percent: number): NOTIFICATION_TYPE => {
  return percent === 0
    ? NOTIFICATION_TYPE.INFO
    : percent <= 50
    ? NOTIFICATION_TYPE.SUCCESS
    : percent <= 75
    ? NOTIFICATION_TYPE.WARNING
    : NOTIFICATION_TYPE.ERROR
}

const getPercentDisplay = (percent: number): string => {
  return `${percent.toFixed(1)}%`
}

const Header = () => {
  const [chainLoad, setChainLoad] = useState({ load5m: 0, load1h: 0, load24h: 0 })

  useEffect(() => {
    const fetchChainLoad = () => {
      poolPm
        .getChainLoad()
        .then((data) => setChainLoad(data))
        .catch((error) => console.error(error))
    }

    fetchChainLoad()

    const interval = setInterval(fetchChainLoad, 10 * 1000)
    return () => clearInterval(interval)
  }, [])

  const [epochInfo, setEpochInfo] = useState({ epoch: 0, startTime: 0, endTime: 0, nowTime: 0, percent: 0 })

  useEffect(() => {
    const fetchEpoch = () => {
      api.epoch
        .getData()
        .then((data) => setEpochInfo(data))
        .catch((error) => console.error(error))
    }
    const incrementEpoch = () => {
      setEpochInfo((prev) => {
        if (!prev.epoch) return prev
        const nowTime = prev.nowTime + 1000
        const percent = (100 / (prev.endTime - prev.startTime)) * (nowTime - prev.startTime)
        return { ...prev, nowTime, percent }
      })
    }

    fetchEpoch()

    const interval = setInterval(incrementEpoch, 1 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Container
      left={[
        <CardanoLogo key='logo' size={50} />,
        <Text key='title' family='secondary' size={20}>
          {TITLE}
        </Text>,
        <Tooltip key='chain-load-5m' text='Cardano Chain Load'>
          <Status status={getChainLoadStatus(chainLoad.load5m)} title='5m' subtitle={getPercentDisplay(chainLoad.load5m)} withIcon withBackground />
        </Tooltip>,
        <Tooltip key='chain-load-1h' text='Cardano Chain Load'>
          <Status status={getChainLoadStatus(chainLoad.load1h)} title='1h' subtitle={getPercentDisplay(chainLoad.load1h)} withIcon withBackground />
        </Tooltip>,
        <Tooltip key='chain-load-24h' text='Cardano Chain Load'>
          <Status
            status={getChainLoadStatus(chainLoad.load24h)}
            title='24h'
            subtitle={getPercentDisplay(chainLoad.load24h)}
            withIcon
            withBackground
          />
        </Tooltip>,
        <Tooltip key='epoch' text='Cardano Epoch Progress'>
          <Status
            status={NOTIFICATION_TYPE.DEFAULT}
            title={`Epoch ${epochInfo.epoch}`}
            subtitle={getPercentDisplay(epochInfo.percent)}
            withBackground
          />
        </Tooltip>,
      ]}
      right={[<Theme.ToggleDarkMode key='toggle-theme' />]}
    />
  )
}

export default Header
