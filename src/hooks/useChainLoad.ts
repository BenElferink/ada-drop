import { useCallback, useEffect, useState } from 'react'
import poolPm from '@/utils/pool-pm'
import type { ChainLoad } from '@/@types'
import { NOTIFICATION_TYPE } from '@odigos/ui-kit/types'

interface UseChainLoad {
  chainLoad: ChainLoad
  refetch: () => Promise<void>
  resolveChainLoadStatus: (percent: number) => NOTIFICATION_TYPE
}

const EMPTY: ChainLoad = { load5m: 0, load1h: 0, load24h: 0 }

const fetchChainLoad = async (): Promise<ChainLoad> => {
  try {
    const data = await poolPm.getChainLoad()

    return {
      load5m: data.load_5m * 100,
      load1h: data.load_1h * 100,
      load24h: data.load_24h * 100,
    }
  } catch (error) {
    console.error(error)
    return EMPTY
  }
}

const resolveChainLoadStatus: UseChainLoad['resolveChainLoadStatus'] = (percent) => {
  return percent === 0
    ? NOTIFICATION_TYPE.INFO
    : percent <= 50
    ? NOTIFICATION_TYPE.SUCCESS
    : percent <= 75
    ? NOTIFICATION_TYPE.WARNING
    : NOTIFICATION_TYPE.ERROR
}

export const useChainLoad = (): UseChainLoad => {
  const [chainLoad, setChainLoad] = useState<ChainLoad>(EMPTY)
  const refetch = useCallback(() => fetchChainLoad().then(setChainLoad), [])

  useEffect(() => {
    if (!chainLoad.load5m) refetch()
  }, [chainLoad, refetch])

  useEffect(() => {
    const interval = setInterval(refetch, 10 * 1000)
    return () => clearInterval(interval)
  }, [refetch])

  return {
    chainLoad,
    refetch,
    resolveChainLoadStatus,
  }
}
