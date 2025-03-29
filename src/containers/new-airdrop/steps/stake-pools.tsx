import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import api from '@/utils/api'
import { debounce } from '@/functions'
import { StatusType } from '@odigos/ui-kit/types'
import { deepClone } from '@odigos/ui-kit/functions'
import type { DelegatorSettings, FormRef, PoolId } from '@/@types'
import { CenterThis, Divider, FadeLoader, InputList, NotificationNote, SectionTitle, Text } from '@odigos/ui-kit/components'

type Data = DelegatorSettings

interface StakePoolsProps {
  defaultData: Data
}

const resolvePoolIds = async (pools: string[]) => {
  const payload: PoolId[] = []
  let hasError = false

  for await (const str of pools) {
    try {
      if (!!str) {
        const { poolId } = await api.stakePool.getData(str)
        if (!poolId) throw new Error(`no pool ID for: ${str}`)

        if (!payload.find((str) => str === poolId)) {
          payload.push(poolId)
        }
      } else {
        payload.push('')
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      hasError = true
      payload.push(str)
    }
  }

  return { poolIds: payload, hasError }
}

export const StakePools = forwardRef<FormRef<Data>, StakePoolsProps>(({ defaultData }, ref) => {
  const [errors, setErrors] = useState({ message: '', stakePools: '' })
  const [data, setData] = useState(deepClone(defaultData))

  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingPoolIds, setIsFetchingPoolIds] = useState(false)
  const latestPoolsRef = useRef<string[]>([])

  const nonEmpties = useMemo(() => data.stakePools.filter((str) => !!str), [data.stakePools])

  useImperativeHandle(ref, () => ({
    getData: () => ({
      ...data,
      stakePools: nonEmpties,
    }),
    validate: async () => {
      if (!nonEmpties.length) {
        setErrors({ message: 'Missing required fields', stakePools: 'Please enter at least one pool ID' })
        return false
      }

      setIsLoading(true)
      setErrors({ message: '', stakePools: '' })

      let isOk = true

      const { hasError } = await resolvePoolIds(nonEmpties)
      if (hasError) {
        isOk = false
        setErrors({ message: 'Invalid Stake Pool IDs', stakePools: 'Contains invalid pool IDs' })
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
      <SectionTitle title='Stake Pools' description='Enter the Pool IDs of the Stake Pools you wish to airdrop to their delegators.' />
      {!!errors.message && (
        <div style={{ width: '100%' }}>
          <NotificationNote type={StatusType.Error} title={errors.message} />
        </div>
      )}
      <Divider />

      {isFetchingPoolIds ? (
        <CenterThis $gap={12}>
          <FadeLoader scale={1.2} />
          <Text>Resolving Pool IDs...</Text>
        </CenterThis>
      ) : (
        <InputList
          title='Pool IDs'
          tooltip='ID must begin with pool1...'
          value={data.stakePools}
          onChange={(arr) => {
            latestPoolsRef.current = arr

            setData((prev) => ({ ...prev, stakePools: arr }))
            setErrors({ message: '', stakePools: '' })

            debounce(
              resolvePoolIds,
              1000
            )(arr).then(({ poolIds, hasError }) => {
              // Only apply if input hasn't changed
              if (JSON.stringify(latestPoolsRef.current) === JSON.stringify(arr)) {
                // This toggle is after the debounce to trigger a re-render of the input list with new values
                setIsFetchingPoolIds(true)

                setData((prev) => ({ ...prev, stakePools: poolIds }))
                if (hasError) setErrors({ message: '', stakePools: 'Contains invalid pool IDs' })

                setTimeout(() => setIsFetchingPoolIds(false), 1000)
              }
            })
          }}
          errorMessage={errors.stakePools}
        />
      )}
    </>
  )
})

StakePools.displayName = StakePools.name
