import { type Dispatch, forwardRef, type SetStateAction, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { ADA } from '@/constants'
import Theme from '@odigos/ui-kit/theme'
import { useWallet } from '@meshsdk/react'
import { utils, writeFileXLSX } from 'xlsx'
import { StatusType } from '@odigos/ui-kit/types'
import { deepClone } from '@odigos/ui-kit/functions'
import { DownloadIcon, TransactionIcon } from '@/icons'
import type { AirdropSettings, FormRef, PayoutRecipient } from '@/@types'
import { Button, FlexColumn, InteractiveTable, NotificationNote, SectionTitle, Text } from '@odigos/ui-kit/components'
import { formatTokenAmountFromChain, formatTokenAmountToChain, prettyNumber, truncateStringInMiddle } from '@/functions'

type Data = AirdropSettings

interface RunPayoutProps {
  defaultData: Data
  payoutRecipients: PayoutRecipient[]
  setPayoutRecipients: Dispatch<SetStateAction<PayoutRecipient[]>>
}

export const RunPayout = forwardRef<FormRef<Data>, RunPayoutProps>(({ defaultData, payoutRecipients, setPayoutRecipients }, ref) => {
  const theme = Theme.useTheme()
  const { wallet } = useWallet()

  const [errorMessage, setErrorMessage] = useState('')
  const [payoutEnded, setPayoutEnded] = useState(false)
  // const [progress, setProgress] = useState({})

  const devPayed = useRef(false)
  const devFee = useMemo(() => formatTokenAmountToChain(Math.max(1, payoutRecipients.length * 0.5), ADA['DECIMALS']), [payoutRecipients])
  const serviceFee = useMemo(() => `${ADA['SYMBOL']}${prettyNumber(formatTokenAmountFromChain(devFee, ADA['DECIMALS']))} service fee`, [devFee])

  const ticker = useMemo(() => defaultData.tokenName.ticker || defaultData.tokenName.display || defaultData.tokenName.onChain, [defaultData])

  useImperativeHandle(ref, () => ({
    getData: () => defaultData,
    validate: () => {
      if (!payoutEnded) setErrorMessage('Payout is still running, please wait until it ends')
      return Promise.resolve(payoutEnded)
    },
  }))

  const [processedRecipients, setProcessedRecipients] = useState(deepClone(payoutRecipients))

  const buildTXs = useCallback(() => {
    // runPayout(defaultData, setProgress)
    //   .then((...) => {
    //     setPayoutEnded(true)
    //     setErrorMessage('')
    //   })
    //   .catch((error) => {
    //     const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
    //     console.error('ERROR running payout:\n', `${errMsg}\n`, error)
    //     setErrorMessage(errMsg)
    //   })
  }, [])

  const downloadReceipt = useCallback(() => {
    try {
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(
        processedRecipients.map((item) => ({
          amount: formatTokenAmountFromChain(item.payout, defaultData.tokenAmount.decimals),
          tokenName: ticker,
          address: item.address,
          stakeKey: item.stakeKey,
          txHash: item.txHash,
        })),
        { header: ['amount', 'tokenName', 'address', 'stakeKey', 'txHash'] }
      )

      ws['!cols'] = [{ width: 20 }, { width: 15 }, { width: 100 }, { width: 70 }, { width: 70 }]
      utils.book_append_sheet(wb, ws, 'receipt')

      writeFileXLSX(wb, `ADA Drop - receipt (${new Date().toLocaleDateString()}).xlsx`)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
      console.error('ERROR downloading receipt:\n', `${errMsg}\n`, error)
      setErrorMessage(errMsg)
    }
  }, [processedRecipients, defaultData, ticker])

  const totalAmount = useMemo(() => {
    const count = prettyNumber(
      formatTokenAmountFromChain(
        payoutRecipients.reduce((prev, curr) => prev + curr.payout, 0),
        defaultData.tokenAmount.decimals
      )
    )

    if (ticker === 'ADA') return `${ADA['SYMBOL']}${count}`
    return `${count} ${ticker}`
  }, [payoutRecipients, defaultData, ticker])

  return (
    <>
      <FlexColumn $gap={16} style={{ width: '100%', alignItems: 'unset' }}>
        <SectionTitle
          title='Airdrop Payout'
          description={`${totalAmount} • ${processedRecipients.length} wallet${processedRecipients.length > 1 ? 's' : ''} • ${serviceFee}`}
          actionButton={
            payoutEnded ? (
              <Button variant='tertiary' onClick={downloadReceipt} style={{ textDecoration: 'none' }}>
                <DownloadIcon size={24} fill={theme.text.success} />
                <Text color={theme.text.success} family='secondary'>
                  Download Receipt
                </Text>
              </Button>
            ) : (
              <Button
                variant='tertiary'
                onClick={buildTXs}
                style={{ textDecoration: 'none', backgroundColor: theme.colors.majestic_blue_soft + Theme.opacity.hex['030'] }}
              >
                <TransactionIcon size={24} fill={theme.text.default} />
                <Text color={theme.text.default} family='secondary'>
                  Build TXs
                </Text>
              </Button>
            )
          }
        />
        <div style={{ width: '100%' }}>
          {payoutEnded && (
            <NotificationNote
              type={StatusType.Success}
              title='Done'
              message='you can download a copy of the receipt, thank you for using our service!'
            />
          )}
        </div>
        {errorMessage && (
          <div style={{ width: '100%' }}>
            <NotificationNote type={StatusType.Error} message={errorMessage} />
          </div>
        )}
      </FlexColumn>

      {/* {progress.xxx?.max ? <ProgressBar label='XXX' max={progress.xxx.max} current={progress.xxx.current} /> : null} */}

      <InteractiveTable
        columns={[
          { key: 'amount', title: 'Amount' },
          { key: 'stakeKey', title: 'Stake Key' },
          { key: 'txHash', title: 'Tx Hash' },
        ]}
        rows={payoutRecipients.map((item) => ({
          cells: [
            { columnKey: 'amount', value: prettyNumber(formatTokenAmountFromChain(item.payout, defaultData.tokenAmount.decimals)) },
            { columnKey: 'stakeKey', value: !item.txHash ? truncateStringInMiddle(item.stakeKey, 15) : item.stakeKey },
            { columnKey: 'txHash', value: truncateStringInMiddle(item.txHash, 15) || truncateStringInMiddle(item.stakeKey, 15) || '-' },
          ],
        }))}
      />
    </>
  )
})

RunPayout.displayName = RunPayout.name
