import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { ADA } from '@/constants'
import Theme from '@odigos/ui-kit/theme'
import { useWallet } from '@meshsdk/react'
import { ProgressBar } from '@/components'
import { utils, writeFileXLSX } from 'xlsx'
import { useConnectedWallet } from '@/hooks'
import { firestore } from '@/utils/firebase'
import { PlusIcon } from '@odigos/ui-kit/icons'
import { batchTxs } from '../helpers/batch-txs'
import { StatusType } from '@odigos/ui-kit/types'
import { DownloadIcon, TransactionIcon } from '@/icons'
import { deepClone, getStatusIcon } from '@odigos/ui-kit/functions'
import { verifyMinRequiredAda } from '../helpers/verify-min-required-ada'
import { verifyMinRequiredBalance } from '../helpers/verify-min-required-balance'
import type { Airdrop, AirdropSettings, FormRef, PayoutProgressCounts, PayoutRecipient } from '@/@types'
import { formatTokenAmountFromChain, formatTokenAmountToChain, getTokenName, prettyNumber, truncateStringInMiddle } from '@/functions'
import {
  Button,
  FlexColumn,
  FlexRow,
  IconButton,
  IconWrapped,
  InteractiveTable,
  NotificationNote,
  SectionTitle,
  Text,
  Tooltip,
  WarningModal,
} from '@odigos/ui-kit/components'

type Data = AirdropSettings

interface RunPayoutProps {
  defaultData: Data
  payoutRecipients: PayoutRecipient[]
}

export const RunPayout = forwardRef<FormRef<Data>, RunPayoutProps>(({ defaultData, payoutRecipients }, ref) => {
  const theme = Theme.useTheme()
  const { wallet } = useWallet()
  const { stakeKey, lovelaces, tokens } = useConnectedWallet()

  const [status, setStatus] = useState({ type: StatusType.Info, title: '', message: '' })
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState<PayoutProgressCounts>({ batch: { current: 0, max: 0 } })

  const [processedRecipients, setProcessedRecipients] = useState(deepClone(payoutRecipients))
  const devFee = useMemo(() => formatTokenAmountToChain(Math.max(1, payoutRecipients.length * 0.5), ADA['DECIMALS']), [payoutRecipients])

  const ticker = useMemo(() => defaultData.tokenName.ticker || defaultData.tokenName.display || defaultData.tokenName.onChain, [defaultData])
  const serviceFee = useMemo(
    () => `${ADA['SYMBOL']}${prettyNumber(formatTokenAmountFromChain(devFee, ADA['DECIMALS'], false))} service fee`,
    [devFee]
  )

  useImperativeHandle(ref, () => ({
    getData: () => defaultData,
    validate: () => {
      let isOk = status.type !== StatusType.Error

      if (isOk && !ended) {
        isOk = false
        setStatus({ type: StatusType.Warning, title: '', message: 'Payout is still running, please wait until it ends' })
      }

      return Promise.resolve(isOk)
    },
  }))

  useEffect(() => {
    if (!started && !ended && !!lovelaces && !!devFee) {
      const { isError: balanceErr, missingBalance } = verifyMinRequiredBalance(processedRecipients, tokens, defaultData.tokenId)

      // not enough funds to airdrop
      if (balanceErr) {
        setStatus({
          type: StatusType.Error,
          title: 'Insufficient airdrop funds',
          message: `Please acquire another ${prettyNumber(
            formatTokenAmountFromChain(missingBalance, defaultData.tokenAmount.decimals)
          )} ${getTokenName(defaultData.tokenName)} and try again`,
        })
      } else {
        const isLovelaces = defaultData.tokenId === 'lovelace'
        const devFeeAda = formatTokenAmountFromChain(devFee, ADA['DECIMALS'])

        const {
          isError: adaErr,
          neededAda,
          ownedAda,
          missingAda,
          minAdaPerWallet,
          minLovelacesPerWallet,
        } = verifyMinRequiredAda(processedRecipients, lovelaces, isLovelaces)

        // not enough ada for cardano + fees
        if (adaErr) {
          setStatus({
            type: StatusType.Error,
            title: 'Insufficient ADA for Cardano',
            message: `Please acquire another ${ADA['SYMBOL']}${prettyNumber(missingAda + devFeeAda)} and try again`,
          })
        }
        // not enough ada for fees
        else if (neededAda + devFeeAda > ownedAda) {
          setStatus({
            type: StatusType.Error,
            title: 'Insufficient ADA for fees',
            message: `Please acquire another ${ADA['SYMBOL']}${prettyNumber(devFeeAda)} and try again`,
          })
        } else {
          const hasRecipientsWithLessThanMinimumLovelaces = isLovelaces
            ? processedRecipients.some((recipient) => recipient.payout < minLovelacesPerWallet)
            : false

          if (hasRecipientsWithLessThanMinimumLovelaces) {
            setStatus({
              type: StatusType.Warning,
              title: 'Insufficient recipients',
              message: `Some wallets have less than ${ADA['SYMBOL']}${minAdaPerWallet} assigned to them, please check the list below or they will be excluded from the airdrop`,
            })
          } else {
            setStatus((prev) => (prev.title.includes('Insufficient') ? { type: StatusType.Info, title: '', message: '' } : prev))
          }
        }
      }
    }
  }, [started, ended, lovelaces, tokens, devFee, processedRecipients, defaultData])

  const runPayout = (): void => {
    setStarted(true)
    setStatus({ type: StatusType.Info, title: '', message: '' })
    batchTxs(0, wallet, defaultData.tokenId, devFee, processedRecipients, setProcessedRecipients, (msg, prgrs) => {
      setProgress(prgrs)
      setStatus({ type: StatusType.Info, title: '', message: msg })
    })
      .then((recipients) => {
        setStatus({ type: StatusType.Success, title: '', message: '' })
        setStarted(false)
        setEnded(true)

        const _dec = defaultData.tokenAmount.decimals
        const totalPayout = recipients.reduce((prev, curr) => prev + curr.payout, 0)

        const airdrop: Airdrop = {
          stakeKey,
          timestamp: Date.now(),

          tokenId: defaultData.tokenId,
          tokenName: defaultData.tokenName,
          tokenAmount: {
            decimals: _dec,
            onChain: totalPayout,
            display: formatTokenAmountFromChain(totalPayout, _dec),
          },
          thumb: defaultData.thumb,

          recipients: recipients.map((item) => ({
            stakeKey: item.stakeKey,
            address: item.address,
            quantity: item.payout,
            txHash: item.txHash as string,
          })),
        }

        firestore
          .collection('airdrops')
          .add(airdrop)
          .then((doc) => console.log('Airdrop saved to Firestore', doc.id))
          .catch((error) => console.error('Error saving airdrop to Firestore:', error))
      })
      .catch((error) => {
        const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
        setStatus({ type: StatusType.Error, title: '', message: errMsg })
        setProgress({ batch: { current: 0, max: 0 } })
        setStarted(false)
      })
  }

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
      setStatus({ type: StatusType.Info, title: '', message: '' })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
      setStatus({ type: StatusType.Error, title: 'Error downloading receipt', message: errMsg })
    }
  }, [processedRecipients, defaultData, ticker])

  const totalAmount = useMemo(() => {
    const count = prettyNumber(
      formatTokenAmountFromChain(
        processedRecipients.reduce((prev, curr) => prev + curr.payout, 0),
        defaultData.tokenAmount.decimals,
        false
      )
    )

    if (ticker === 'ADA') return `${ADA['SYMBOL']}${count}`
    return `${count} ${ticker}`
  }, [processedRecipients, defaultData, ticker])

  const [warn, setWarn] = useState({
    isOpen: false,
    stakeKey: '',
  })

  const rows = useMemo(
    () =>
      processedRecipients.map((item) => {
        const isUnderMin = defaultData.tokenId === 'lovelace' && item.payout < 1000000
        const isPayed = !!item.txHash

        const status = isUnderMin ? StatusType.Error : isPayed ? StatusType.Success : StatusType.Info
        const statusText = isUnderMin ? `Below minim required amount (of ${ADA['SYMBOL']}1)` : isPayed ? 'Payment Success' : 'Pending Payment'

        return {
          status,
          cells: [
            {
              columnKey: 'amount',
              value: prettyNumber(formatTokenAmountFromChain(item.payout, defaultData.tokenAmount.decimals, false)),
            },
            {
              columnKey: 'stakeKey',
              value: truncateStringInMiddle(item.stakeKey, 11),
            },
            {
              columnKey: 'txHash',
              value: truncateStringInMiddle(item.txHash, 11) || '-',
            },
            {
              columnKey: 'status',
              component: () => {
                return (
                  <FlexRow>
                    <Tooltip text={statusText}>
                      <IconWrapped icon={getStatusIcon(status, theme)} />
                    </Tooltip>
                    {status === StatusType.Error && (
                      <IconButton withPing pingColor={theme.colors.majestic_blue} onClick={() => setWarn({ isOpen: true, stakeKey: item.stakeKey })}>
                        <PlusIcon size={24} />
                      </IconButton>
                    )}
                  </FlexRow>
                )
              },
            },
          ],
        }
      }),
    [processedRecipients, defaultData, theme]
  )

  return (
    <>
      <FlexColumn $gap={16} style={{ width: '100%', alignItems: 'unset' }}>
        <SectionTitle
          title='Airdrop Payout'
          description={`${totalAmount} to airdrop • ${processedRecipients.length} wallet${processedRecipients.length > 1 ? 's' : ''} • ${serviceFee}`}
          actionButton={
            ended ? (
              <Button variant='tertiary' onClick={downloadReceipt} style={{ textDecoration: 'none' }}>
                <DownloadIcon size={24} fill={theme.text.success} />
                <Text color={theme.text.success} family='secondary'>
                  Download Receipt
                </Text>
              </Button>
            ) : (
              <Button
                variant='tertiary'
                disabled={started || ended}
                onClick={runPayout}
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
          {ended && <NotificationNote type={StatusType.Success} title='Airdrop complete' message='You can download a copy of the receipt' />}
        </div>
        {(!!status.title || !!status.message) && (
          <div style={{ width: '100%' }}>
            <NotificationNote type={status.type} title={status.title} message={status.message} />
          </div>
        )}
      </FlexColumn>

      {progress.batch?.max ? <ProgressBar label='TX Batches' max={progress.batch.max} current={progress.batch.current} /> : null}

      <div style={{ width: '100%' }}>
        <InteractiveTable
          columns={[
            { key: 'status', title: '' },
            { key: 'amount', title: 'Amount' },
            { key: 'stakeKey', title: 'Stake Key' },
            { key: 'txHash', title: 'Tx Hash' },
          ]}
          rows={rows}
        />
      </div>

      <WarningModal
        isOpen={warn.isOpen}
        noOverlay
        title={`Round up to ${ADA['SYMBOL']}1?`}
        description={warn.stakeKey}
        note={{
          type: StatusType.Warning,
          title: '',
          message: `This will increase the total pool size!`,
        }}
        approveButton={{
          text: `Yes (${String.fromCodePoint(0x21b5)})`,
          variant: 'warning',
          onClick: () => {
            setProcessedRecipients((prev) =>
              prev.map((item) =>
                item.stakeKey === warn.stakeKey
                  ? {
                      ...item,
                      payout: formatTokenAmountToChain(1, ADA['DECIMALS']),
                    }
                  : item
              )
            )
            setWarn({ isOpen: false, stakeKey: '' })
          },
        }}
        denyButton={{
          text: 'No',
          onClick: () => {
            setWarn({ isOpen: false, stakeKey: '' })
          },
        }}
      />
    </>
  )
})

RunPayout.displayName = RunPayout.name
