import { useCallback, useEffect, useState } from 'react'
import api from '@/utils/api'
import { useWalletStore } from '@/store'
import type { PopulatedToken } from '@/@types'
import type { AssetExtended } from '@meshsdk/core'
import { deepClone } from '@odigos/ui-kit/functions'
import { ADA, POPULATED_LOVELACE } from '@/constants'
import { useLovelace, useRewardAddress, useWallet } from '@meshsdk/react'
import { chunk, eachLimit, formatTokenAmountFromChain } from '@/functions'

interface UseConnectedWallet {
  stakeKey: string
  lovelaces: number
  tokens: PopulatedToken[]
  refetch: () => Promise<void>
  isFetching: boolean
}

const fetchTokens = async (assets?: AssetExtended[]): Promise<PopulatedToken[]> => {
  try {
    const tokens: PopulatedToken[] = []

    await eachLimit<AssetExtended[]>(chunk<AssetExtended>(assets || [], 10), 10, async (items) => {
      for await (const { unit, quantity } of items) {
        try {
          const fetchedToken = await api.token.getData(unit)

          if (fetchedToken.isFungible) {
            fetchedToken.tokenAmount.onChain = Number(quantity)
            fetchedToken.tokenAmount.display = formatTokenAmountFromChain(quantity, fetchedToken.tokenAmount.decimals)

            tokens.push(fetchedToken)
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          if (error.code === 'ECONNRESET') {
            console.warn('Connection reset error...')
          } else {
            console.error(error.message)
          }
        }
      }
    })

    return tokens
  } catch (error) {
    console.error(error)
    return []
  }
}

export const useConnectedWallet = (): UseConnectedWallet => {
  const lovelaces = useLovelace()
  const stakeKey = useRewardAddress()
  const { connected, wallet } = useWallet()
  const { tokens, addTokens } = useWalletStore()
  const [isFetching, setIsFetching] = useState(false)

  const refetch = useCallback(
    async () => {
      setIsFetching(true)
      addTokens(await fetchTokens(await wallet.getAssets()))
      setIsFetching(false)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wallet]
  )

  useEffect(() => {
    if (connected && !tokens.length) refetch()
  }, [connected, tokens, refetch])

  useEffect(() => {
    if (connected && !!lovelaces)
      addTokens([
        {
          ...deepClone(POPULATED_LOVELACE),
          tokenAmount: {
            onChain: Number(lovelaces),
            display: formatTokenAmountFromChain(lovelaces || 0, ADA['DECIMALS']),
            decimals: ADA['DECIMALS'],
          },
        },
      ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, lovelaces])

  return {
    stakeKey: stakeKey || '',
    lovelaces: Number(lovelaces || '0'),
    tokens,
    refetch,
    isFetching,
  }
}
