import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { Selected } from '@/components'
import Theme from '@odigos/ui-kit/theme'
import { useConnectedWallet } from '@/hooks'
import { StatusType } from '@odigos/ui-kit/types'
import { deepClone } from '@odigos/ui-kit/functions'
import type { FormRef, PopulatedToken, TokenSelectionSettings } from '@/@types'
import { formatTokenAmountFromChain, formatTokenAmountToChain, getTokenName, prettyNumber } from '@/functions'
import {
  CenterThis,
  DataTab,
  Divider,
  FadeLoader,
  Input,
  NoDataFound,
  NotificationNote,
  SectionTitle,
  Segment,
  Text,
} from '@odigos/ui-kit/components'

type Data = TokenSelectionSettings

enum AmountType {
  Fixed = 'FIXED',
  Percent = 'PERCENT',
}

interface TokenSelectorProps {
  defaultData: Data
  withAmount?: boolean
}

export const TokenSelector = forwardRef<FormRef<Data>, TokenSelectorProps>(({ defaultData, withAmount }, ref) => {
  const theme = Theme.useTheme()
  const [data, setData] = useState(deepClone(defaultData))
  const [errors, setErrors] = useState({
    tokenId: '',
    tokenAmount: '',
  })

  useImperativeHandle(ref, () => ({
    getData: () => data,
    validate: () => {
      const hasId = !!data.tokenId
      const hasAmount = !withAmount || (withAmount && !!data.tokenAmount.onChain)
      const isOk = hasId && hasAmount

      if (isOk) {
        setErrors({ tokenId: '', tokenAmount: '' })
        return Promise.resolve(true)
      } else {
        setErrors({
          tokenId: !hasId ? 'Please select a token to airdrop' : '',
          tokenAmount: !!hasId && !hasAmount ? 'Please select an amount to airdrop' : '',
        })
        return Promise.resolve(false)
      }
    },
  }))

  const { isFetching, tokens } = useConnectedWallet()

  const [amountType, setAmountType] = useState<AmountType>(AmountType.Fixed)

  const maxTokenAmount = useMemo(() => {
    return tokens.find((c) => c.tokenId === data.tokenId)?.tokenAmount
  }, [tokens, data])

  if (isFetching) {
    return (
      <CenterThis $gap={12}>
        <FadeLoader scale={1.2} />
        <Text>Loading balances...</Text>
      </CenterThis>
    )
  }

  if (!tokens.length) {
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
      <SectionTitle title='Choose Token to Airdrop' description='You can airdrop ADA or any Fungible Tokens.' />
      {(!!errors.tokenId || !!errors.tokenAmount) && (
        <div style={{ width: '100%' }}>
          <NotificationNote type={StatusType.Error} title={errors.tokenId || errors.tokenAmount} />
        </div>
      )}
      <Divider />

      {tokens.map((t) => {
        const { tokenId, tokenName, tokenAmount, image } = t
        const isSelected = data.tokenId === tokenId

        if (!!data.tokenId && !isSelected && withAmount) {
          return null
        }

        return (
          <DataTab
            key={tokenId}
            title={getTokenName(tokenName)}
            subTitle={prettyNumber(tokenAmount.display)}
            iconProps={{ iconSrcs: [image.url] }}
            onClick={() => {
              handleClick(isSelected, t)
              setErrors({ tokenId: '', tokenAmount: '' })
            }}
            checkboxProps={{
              withCheckbox: true,
              isChecked: isSelected,
              onCheckboxChange: () => {
                handleClick(isSelected, t)
                setErrors({ tokenId: '', tokenAmount: '' })
              },
            }}
            visualProps={{
              status: errors.tokenId ? StatusType.Error : undefined,
              bgColor: isSelected ? theme.colors.majestic_blue + Theme.opacity.hex['030'] : undefined,
              bgColorHover: isSelected ? theme.colors.majestic_blue + Theme.opacity.hex['040'] : undefined,
            }}
            renderActions={isSelected ? Selected : undefined}
          />
        )
      })}

      {!!data.tokenId && withAmount && (
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
              errorMessage={errors.tokenAmount ? 'Invalid amount' : undefined}
              value={
                amountType === AmountType.Fixed
                  ? prettyNumber(data.tokenAmount.display)
                  : amountType === AmountType.Percent
                  ? `${Math.round((100 / (maxTokenAmount?.display || 0)) * data.tokenAmount.display)}%`
                  : 0
              }
              onChange={(e) => {
                handleAmountChange(e.target.value.replace('%', '').replaceAll(',', ''))
                setErrors({ tokenId: '', tokenAmount: '' })
              }}
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
