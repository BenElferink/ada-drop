import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { Selected } from '@/components'
import Theme from '@odigos/ui-kit/theme'
import { useLovelace } from '@meshsdk/react'
import { useConnectedWallet } from '@/hooks'
import { deepClone } from '@odigos/ui-kit/functions'
import { ADA, POPULATED_LOVELACE } from '@/constants'
import type { FormRef, PopulatedToken, TokenSelectionSettings } from '@/@types'
import { formatTokenAmountFromChain, formatTokenAmountToChain, getTokenName, prettyNumber } from '@/functions'
import { CenterThis, DataTab, FadeLoader, Input, NoDataFound, Segment, Text } from '@odigos/ui-kit/components'
import { StatusType } from '@odigos/ui-kit/types'

type Data = TokenSelectionSettings

enum AmountType {
  Fixed = 'FIXED',
  Percent = 'PERCENT',
}

interface TokenSelectorProps {
  defaultData: Data
}

export const TokenSelector = forwardRef<FormRef<Data>, TokenSelectorProps>(({ defaultData }, ref) => {
  const theme = Theme.useTheme()
  const [data, setData] = useState(defaultData)
  const [errors, setErrors] = useState({
    tokenId: false,
    tokenAmount: false,
  })

  useImperativeHandle(ref, () => ({
    getData: () => data,
    validate: () => {
      const hasId = !!data.tokenId
      const hasAmount = !!data.tokenAmount.onChain

      setErrors({
        tokenId: !hasId,
        tokenAmount: !hasAmount,
      })

      return Promise.resolve({
        isOk: hasId && hasAmount,
        message: !hasId
          ? 'Please select a token to airdrop'
          : !hasAmount
          ? 'Please select an amount to airdrop'
          : !hasId && !hasAmount
          ? 'Please select a token and amount to airdrop'
          : '',
      })
    },
  }))

  const { isFetching, tokens } = useConnectedWallet()
  const lovelaces = useLovelace()

  const coins = useMemo(() => {
    const payload: PopulatedToken[] = [...tokens]

    if (!!lovelaces) {
      payload.unshift({
        ...deepClone(POPULATED_LOVELACE),
        tokenAmount: {
          onChain: Number(lovelaces),
          display: formatTokenAmountFromChain(lovelaces, ADA['DECIMALS']),
          decimals: ADA['DECIMALS'],
        },
      })
    }

    return payload
  }, [tokens, lovelaces])

  const [amountType, setAmountType] = useState<AmountType>(AmountType.Fixed)

  const maxTokenAmount = useMemo(() => {
    return coins.find((c) => c.tokenId === data.tokenId)?.tokenAmount
  }, [coins, data])

  if (isFetching) {
    return (
      <CenterThis $gap={12}>
        <FadeLoader scale={1.2} />
        <Text>Loading balances...</Text>
      </CenterThis>
    )
  }

  if (!coins.length) {
    return (
      <CenterThis>
        <NoDataFound
          title='No tokens or ADA in wallet'
          subTitle='Please send the required balance to this wallet, or try connecting another wallet'
        />
      </CenterThis>
    )
  }

  const handleClick = (isSelected: boolean, coin: PopulatedToken) => {
    setData((prev) =>
      isSelected
        ? {
            ...prev,
            thumb: '',
            tokenId: '',
            tokenName: { onChain: '', display: '', ticker: '' },
            tokenAmount: { onChain: 0, display: 0, decimals: 0 },
          }
        : {
            ...prev,
            thumb: coin.image.ipfs || coin.image.url,
            tokenId: coin.tokenId,
            tokenName: coin.tokenName,
            tokenAmount: { onChain: 0, display: 0, decimals: coin.tokenAmount.decimals },
          }
    )
  }

  const handleAmountChange = (val: string) => {
    let v = Number(val)

    if (!isNaN(v)) {
      if (amountType === AmountType.Fixed) v = formatTokenAmountToChain(v, data.tokenAmount.decimals)
      v = Math.floor(v)

      if (amountType === AmountType.Fixed) {
        const min = 0
        const max = maxTokenAmount?.onChain || 0

        // verify the amount is between the min and max ranges (with the help of available balance)
        v = v < min ? min : v > max ? max : v

        setErrors((prev) => ({ ...prev, tokenAmount: v < min || v > max }))
        setData((prev) => ({
          ...prev,
          tokenAmount: {
            onChain: v,
            display: formatTokenAmountFromChain(v, prev.tokenAmount.decimals),
            decimals: prev.tokenAmount.decimals,
          },
        }))
      }

      if (amountType === AmountType.Percent) {
        const min = 0
        const max = 100

        v = v < min ? min : v > max ? max : v
        v = Math.floor((maxTokenAmount?.onChain || 0) * (v / 100))

        setErrors((prev) => ({ ...prev, tokenAmount: v < min || v > max }))
        setData((prev) => ({
          ...prev,
          tokenAmount: {
            onChain: v,
            display: formatTokenAmountFromChain(v, prev.tokenAmount.decimals),
            decimals: prev.tokenAmount.decimals,
          },
        }))
      }
    }
  }

  return (
    <>
      <Text>Choose a token to airdrop</Text>

      {coins.map((coin) => {
        const { tokenId, tokenName, tokenAmount, image } = coin
        const isSelected = data.tokenId === tokenId

        if (!!data.tokenId && !isSelected) {
          return null
        }

        return (
          <DataTab
            key={tokenId}
            iconSrc={image.url}
            title={getTokenName(tokenName)}
            subTitle={prettyNumber(tokenAmount.display)}
            status={errors.tokenId ? StatusType.Error : undefined}
            onClick={() => {
              handleClick(isSelected, coin)
              setErrors({ tokenId: false, tokenAmount: false })
            }}
            onCheckboxChange={() => {
              handleClick(isSelected, coin)
              setErrors({ tokenId: false, tokenAmount: false })
            }}
            withCheckbox
            isChecked={isSelected}
            renderActions={isSelected ? Selected : undefined}
          />
        )
      })}

      {!!data.tokenId && (
        <>
          <Text>Choose amount to airdrop</Text>

          <div style={{ width: '100%' }}>
            <Segment
              selected={amountType}
              setSelected={setAmountType}
              options={[
                {
                  label: 'Fixed Amount',
                  value: AmountType.Fixed,
                  selectedBgColor: theme.colors.majestic_blue,
                },
                {
                  label: 'Percent Amount',
                  value: AmountType.Percent,
                  selectedBgColor: theme.colors.majestic_blue,
                },
              ]}
            />
          </div>

          <div style={{ width: '100%' }}>
            <Input
              errorMessage={errors.tokenAmount ? 'Please enter a valid amount' : undefined}
              value={
                amountType === AmountType.Fixed
                  ? prettyNumber(data.tokenAmount.display)
                  : amountType === AmountType.Percent
                  ? `${Math.round((100 / (maxTokenAmount?.display || 0)) * data.tokenAmount.display)}%`
                  : 0
              }
              onChange={(e) => handleAmountChange(e.target.value.replace('%', '').replaceAll(',', ''))}
            />

            {amountType === AmountType.Fixed && !errors.tokenAmount ? (
              <Text size={12} style={{ padding: '4px 0' }}>
                Translates to: {Math.round((100 / (maxTokenAmount?.display || 0)) * data.tokenAmount.display)}%
              </Text>
            ) : amountType === AmountType.Percent && !errors.tokenAmount ? (
              <Text size={12} style={{ padding: '4px 0' }}>
                Translates to: {prettyNumber(data.tokenAmount.display)} {getTokenName(data.tokenName)}
              </Text>
            ) : null}
          </div>
        </>
      )}
    </>
  )
})

TokenSelector.displayName = TokenSelector.name
