import { useCallback, useEffect } from 'react'
import type { Airdrop } from '@/@types'
import { useAirdropStore } from '@/store'
import { firestore } from '@/utils/firebase'

interface UseAirdrops {
  airdrops: Airdrop[]
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

  const refetch = useCallback(
    () => fetchAirdrops().then(setAirdrops),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    if (!airdrops.length) refetch()
  }, [airdrops, refetch])

  return {
    airdrops,
    refetch,
  }
}
