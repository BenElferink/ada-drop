import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import api from '@/utils/api'
import { debounce } from '@/functions'
import { StatusType } from '@odigos/ui-kit/types'
import { deepClone } from '@odigos/ui-kit/functions'
import type { BlacklistSettings, FormRef, StakeKey } from '@/@types'
import { CenterThis, Divider, FadeLoader, InputList, NotificationNote, SectionTitle, Text } from '@odigos/ui-kit/components'

// TODO: add support for populating tokens based on block-height

type Data = BlacklistSettings

interface BlacklistProps {
  defaultData: Data
  withWallets?: boolean
  withTokenIds?: boolean
}

const resolveStakeKeys = async (wallets: string[]) => {
  const payload: StakeKey[] = []
  let hasError = false

  for await (const str of wallets) {
    try {
      if (!!str) {
        const { stakeKey } = await api.wallet.getData(str)
        if (!stakeKey) throw new Error(`no stake key for: ${str}`)

        if (!payload.find((str) => str === stakeKey)) {
          payload.push(stakeKey)
        }
      } else {
        payload.push('')
      }
    } catch (_) {
      hasError = true
      payload.push(str)
    }
  }

  return { sKeys: payload, hasError }
}

const resolveTokenIds = async (tokens: string[]) => {
  const payload: StakeKey[] = []
  let hasError = false

  for await (const str of tokens) {
    try {
      if (!!str) {
        const { tokenId } = await api.token.getData(str)
        if (!tokenId) throw new Error(`no token ID for: ${str}`)

        if (!payload.find((str) => str === tokenId)) {
          payload.push(tokenId)
        }
      } else {
        payload.push('')
      }
    } catch (_) {
      hasError = true
      payload.push(str)
    }
  }

  return { tokenIds: payload, hasError }
}

export const Blacklist = forwardRef<FormRef<Data>, BlacklistProps>(({ defaultData, withWallets, withTokenIds }, ref) => {
  const [errors, setErrors] = useState({ message: '', wallets: '', tokens: '' })
  const [data, setData] = useState(deepClone(defaultData))

  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingStakeKeys, setIsFetchingStakeKeys] = useState(false)
  const [isFetchingTokenIds, setIsFetchingTokenIds] = useState(false)
  const latestWalletsRef = useRef<string[]>([])
  const latestTokensRef = useRef<string[]>([])

  const nonEmptyWallets = useMemo(() => data.blacklistWallets.filter((str) => !!str), [data.blacklistWallets])
  const nonEmptyTokens = useMemo(() => data.blacklistTokens.filter((str) => !!str), [data.blacklistTokens])

  useImperativeHandle(ref, () => ({
    getData: () => ({
      ...data,
      blacklistWallets: nonEmptyWallets,
      blacklistTokens: nonEmptyTokens,
    }),
    validate: async () => {
      setIsLoading(true)
      setErrors({ message: '', wallets: '', tokens: '' })

      let isOk = true

      const { hasError: e1 } = await resolveStakeKeys(nonEmptyWallets)
      if (e1) {
        isOk = false
        setErrors((prev) => ({ ...prev, message: 'Invalid values', wallets: 'Contains invalid wallets' }))
      }

      const { hasError: e2 } = await resolveTokenIds(nonEmptyTokens)
      if (e2) {
        isOk = false
        setErrors((prev) => ({ ...prev, message: 'Invalid values', tokens: 'Contains invalid asset IDs' }))
      }

      setIsLoading(false)
      return Promise.resolve(isOk)
    },
  }))

  if (isLoading) {
    return (
      <CenterThis $gap={12}>
        <FadeLoader scale={1.2} />
        <Text>Verifying Data...</Text>
      </CenterThis>
    )
  }

  return (
    <>
      <SectionTitle title='Blacklist' description='You can optionally blacklist certain wallets or assets, excluding them from the airdrop.' />
      {!!errors.message && (
        <div style={{ width: '100%' }}>
          <NotificationNote type={StatusType.Error} title={errors.message} />
        </div>
      )}

      {withWallets && (
        <>
          <Divider />
          {isFetchingStakeKeys ? (
            <CenterThis $gap={12}>
              <FadeLoader scale={1.2} />
              <Text>Resolving Stake Keys...</Text>
            </CenterThis>
          ) : (
            <InputList
              title='Wallets to Blacklist'
              tooltip='Enter the wallets you want to blacklist from the airdrop. These wallets will not get any share of the airdrop.'
              value={data.blacklistWallets}
              onChange={(arr) => {
                latestWalletsRef.current = arr

                setData((prev) => ({ ...prev, blacklistWallets: arr }))
                setErrors((prev) => ({ ...prev, message: '', wallets: '' }))

                debounce(
                  resolveStakeKeys,
                  1000
                )(arr).then(({ sKeys, hasError }) => {
                  // Only apply if input hasn't changed
                  if (JSON.stringify(latestWalletsRef.current) === JSON.stringify(arr)) {
                    // This toggle is after the debounce to trigger a re-render of the input list with new values
                    setIsFetchingStakeKeys(true)

                    setData((prev) => ({ ...prev, blacklistWallets: sKeys }))
                    if (hasError) setErrors((prev) => ({ ...prev, wallets: 'Contains invalid wallets' }))

                    setTimeout(() => setIsFetchingStakeKeys(false), 1000)
                  }
                })
              }}
              errorMessage={errors.wallets}
            />
          )}
        </>
      )}

      {withTokenIds && (
        <>
          <Divider />
          {isFetchingTokenIds ? (
            <CenterThis $gap={12}>
              <FadeLoader scale={1.2} />
              <Text>Resolving Asset IDs...</Text>
            </CenterThis>
          ) : (
            <InputList
              title='Asset IDs to Blacklist'
              tooltip='Provide the asset IDs you want to blacklist. If a wallet meets other conditions but holds these assets, they will still get their share of the airdrop, minus these assets.'
              value={data.blacklistTokens}
              onChange={(arr) => {
                latestTokensRef.current = arr

                setData((prev) => ({ ...prev, blacklistTokens: arr }))
                setErrors((prev) => ({ ...prev, message: '', tokens: '' }))

                debounce(
                  resolveTokenIds,
                  1000
                )(arr).then(({ tokenIds, hasError }) => {
                  // Only apply if input hasn't changed
                  if (JSON.stringify(latestTokensRef.current) === JSON.stringify(arr)) {
                    // This toggle is after the debounce to trigger a re-render of the input list with new values
                    setIsFetchingTokenIds(true)

                    setData((prev) => ({ ...prev, blacklistTokens: tokenIds }))
                    if (hasError) setErrors((prev) => ({ ...prev, tokens: 'Contains invalid asset IDs' }))

                    setTimeout(() => setIsFetchingTokenIds(false), 1000)
                  }
                })
              }}
              errorMessage={errors.tokens}
            />
          )}
        </>
      )}
    </>
  )
})

Blacklist.displayName = Blacklist.name
