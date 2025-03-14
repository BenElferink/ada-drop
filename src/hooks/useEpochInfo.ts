import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import type { EpochInfo } from '@/@types'

interface UseEpochInfo {
  epochInfo: EpochInfo
  refetch: () => Promise<void>
}

const EMPTY = { epoch: 0, startTime: 0, endTime: 0, nowTime: 0, percent: 0 }

const fetchEpoch = async (): Promise<EpochInfo> => {
  try {
    const { data } = await axios.get<EpochInfo>('/api/epoch')

    return data
  } catch (error) {
    console.error(error)
    return EMPTY
  }
}

export const useEpochInfo = (): UseEpochInfo => {
  const [epochInfo, setEpochInfo] = useState(EMPTY)
  const refetch = useCallback(() => fetchEpoch().then(setEpochInfo), [])

  useEffect(() => {
    if (!epochInfo.epoch) refetch()
  }, [epochInfo, refetch])

  useEffect(() => {
    const increment = () => {
      setEpochInfo((prev) => {
        if (!prev.epoch) return prev
        const nowTime = prev.nowTime + 1000
        const percent = (100 / (prev.endTime - prev.startTime)) * (nowTime - prev.startTime)
        return { ...prev, nowTime, percent }
      })
    }

    const interval = setInterval(increment, 1 * 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    epochInfo,
    refetch,
  }
}
