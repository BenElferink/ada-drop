import { useCallback, useEffect, useMemo } from 'react'
import { useAirdropStore } from '@/store'
import { firestore } from '@/utils/firebase'
import { resolveMonthName } from '@/functions'
import type { Airdrop, AirdropMonth } from '@/@types'

interface UseAirdrops {
  airdrops: Airdrop[]
  months: AirdropMonth[]
  refetch: () => Promise<void>
}

const fetchAirdrops = async (): Promise<Airdrop[]> => {
  try {
    const collection = firestore.collection('airdrops')
    const collectionQuery = await collection.get()

    const docs = collectionQuery.docs
      .map((doc) => {
        const data = doc.data() as Airdrop

        return {
          ...data,
          id: doc.id,
        }
      })
      .filter((x) => x.tokenAmount.onChain)
      .sort((a, b) => b.timestamp - a.timestamp)

    return docs
  } catch (error) {
    console.error(error)
    return []
  }
}

export const useAirdrops = (): UseAirdrops => {
  const { airdrops, setAirdrops } = useAirdropStore()
  const refetch = useCallback(() => fetchAirdrops().then(setAirdrops), [setAirdrops])

  useEffect(() => {
    if (!airdrops.length) refetch()
  }, [airdrops, refetch])

  const months = useMemo(() => {
    const payload: AirdropMonth[] = []

    airdrops.forEach((item) => {
      const date = new Date(item.timestamp)
      const label = `${date.getFullYear()} ${resolveMonthName(date.getMonth())}`
      const foundIdx = payload.findIndex((x) => x.label === label)

      if (foundIdx === -1) {
        payload.push({
          label,
          airdropCount: 1,
          airdropIds: [item.id],
        })
      } else {
        payload[foundIdx].airdropCount++
        payload[foundIdx].airdropIds.push(item.id)
      }
    })

    return payload
  }, [airdrops])

  return {
    airdrops,
    months,
    refetch,
  }
}
