import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import api from '@/utils/api'
import Theme from '@odigos/ui-kit/theme'
import { ProgressBar } from '@/components'
import { Transaction } from '@meshsdk/core'
import { useWallet } from '@meshsdk/react'
import { utils, writeFileXLSX } from 'xlsx'
import { useConnectedWallet } from '@/hooks'
import { firestore } from '@/utils/firebase'
import { PlusIcon } from '@odigos/ui-kit/icons'
import { StatusType } from '@odigos/ui-kit/types'
import { DownloadIcon, TransactionIcon } from '@/icons'
import { deepClone, getStatusIcon } from '@odigos/ui-kit/functions'
import { verifyMinRequiredAda } from '../helpers/verify-min-required-ada'
import { verifyMinRequiredBalance } from '../helpers/verify-min-required-balance'
import { ADA, MIN_ADA_PER_WALLET, MIN_LOVELACES_PER_WALLET, WALLETS } from '@/constants'
import type { Airdrop, AirdropSettings, FormRef, PayoutProgressCounts, PayoutRecipient, StakeKey } from '@/@types'
import { formatTokenAmountFromChain, formatTokenAmountToChain, getTokenName, prettyNumber, truncateStringInMiddle, txConfirmation } from '@/functions'
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
  const [allowPreFlightChecks, setAllowPreFlightChecks] = useState(true)
  const [ranPreFlightChecks, setRanPreFlightChecks] = useState(false)
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState<PayoutProgressCounts>({ batch: { current: 0, max: 0 } })

  const [processedRecipients, setProcessedRecipients] = useState(deepClone(payoutRecipients))
  const devFee = useMemo(
    () => formatTokenAmountToChain(Math.max(MIN_ADA_PER_WALLET, payoutRecipients.length * 0.5), ADA['DECIMALS']),
    [payoutRecipients]
  )
  const devPayed = useRef(false)
  const ticker = useMemo(() => defaultData.tokenName.ticker || defaultData.tokenName.display || defaultData.tokenName.onChain, [defaultData])

  useImperativeHandle(ref, () => ({
    getData: () => defaultData,
    validate: () => {
      let isOk = status.type !== StatusType.Error

      if (isOk && !started && !ended) {
        isOk = false
        setStatus({ type: StatusType.Warning, title: '', message: 'Payout not started, please click "Batch TXs"' })
      }
      if (isOk && !ended) {
        isOk = false
        setStatus({ type: StatusType.Warning, title: '', message: 'Payout is still running, please wait until it ends' })
      }

      return Promise.resolve(isOk)
    },
  }))

  useEffect(() => {
    if (allowPreFlightChecks) {
      setStatus((prev) =>
        !prev.title && !prev.message
          ? {
              type: StatusType.Info,
              title: 'Preflight checks',
              message: 'Verifying final output vs. your wallet balance',
            }
          : prev
      )

      if (!!lovelaces) {
        setTimeout(() => {
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
            const isLovelace = defaultData.tokenId === 'lovelace'
            const devFeeAda = formatTokenAmountFromChain(devFee, ADA['DECIMALS'])

            const { isError: adaErr, neededAda, ownedAda, missingAda } = verifyMinRequiredAda(processedRecipients, lovelaces, isLovelace)

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
                message: `Please acquire another ${ADA['SYMBOL']}${prettyNumber(neededAda + devFeeAda - ownedAda)} and try again`,
              })
            } else {
              const hasRecipientsWithLessThanMinimumLovelaces =
                defaultData.tokenId === 'lovelace' && processedRecipients.some((recipient) => recipient.payout < MIN_LOVELACES_PER_WALLET)

              if (hasRecipientsWithLessThanMinimumLovelaces) {
                setStatus({
                  type: StatusType.Warning,
                  title: 'Insufficient recipients',
                  message: `Some wallets have less than ${ADA['SYMBOL']}${MIN_ADA_PER_WALLET} assigned to them, please check the list below or they will be excluded from the airdrop`,
                })
              } else {
                setStatus((prev) =>
                  prev.title?.includes('Insufficient') || prev.title?.includes('Preflight')
                    ? {
                        type: StatusType.Info,
                        title: '',
                        message: '',
                      }
                    : prev
                )
              }
            }
          }

          setRanPreFlightChecks(true)
        }, 1000)
      }
    }
  }, [allowPreFlightChecks, lovelaces, tokens, devFee, processedRecipients, defaultData])

  const runPayout = useCallback(
    async (batchSize: number = 0, prevDifference?: number): Promise<void> => {
      setAllowPreFlightChecks(false)
      setStarted(true)
      setStatus({ type: StatusType.Info, title: '', message: '' })

      const unpayedWallets = processedRecipients.filter(({ txHash }) => !txHash)
      if (!devPayed.current)
        unpayedWallets.unshift({
          stakeKey: WALLETS['STAKE_KEYS']['DEV'],
          address: WALLETS['ADDRESSES']['DEV'],
          payout: devFee,
          isDev: true,
        })

      if (!batchSize) batchSize = Math.min(unpayedWallets.length, defaultData.tokenId === 'lovelace' ? 200 : 100)
      const batches: PayoutRecipient[][] = []

      for (let i = 0; i < unpayedWallets.length; i += batchSize) {
        batches.push(unpayedWallets.slice(i, (i / batchSize + 1) * batchSize))
      }

      setStatus({ type: StatusType.Info, title: 'Batching transactions', message: `Trying batch size: ${batchSize}` })
      setProgress({ batch: { current: 0, max: batches.length } })

      const dbRecipients: {
        stakeKey: StakeKey
        txHash: string
        quantity: number
      }[] = []

      try {
        for await (const batch of batches) {
          const tx = new Transaction({
            initiator: wallet,
          })

          for (const { address, payout, isDev } of batch) {
            if (defaultData.tokenId === 'lovelace' || isDev) {
              if (payout < MIN_LOVELACES_PER_WALLET) {
                // !! skip because the user did not approve adding this amount
              } else {
                tx.sendLovelace({ address }, String(payout))
              }
            } else {
              tx.sendAssets({ address }, [
                {
                  unit: defaultData.tokenId,
                  quantity: String(payout),
                },
              ])
            }
          }

          // this may throw an error if TX size is over the limit
          const unsignedTx = await tx.build()
          const signedTx = await wallet.signTx(unsignedTx)
          const txHash = await wallet.submitTx(signedTx)

          if (!devPayed.current) devPayed.current = true

          setStatus({ type: StatusType.Info, title: 'Awaiting network confirmation', message: txHash })
          await txConfirmation(txHash)
          setProgress((prev) => ({ batch: { current: (prev.batch?.current || 0) + 1, max: batches.length } }))

          dbRecipients.push(...batch.filter(({ isDev }) => !isDev).map(({ stakeKey, payout }) => ({ stakeKey, txHash, quantity: payout })))

          setProcessedRecipients((prev) =>
            prev.map((item) =>
              batch.some(({ stakeKey }) => stakeKey === item.stakeKey)
                ? {
                    ...item,
                    txHash,
                  }
                : item
            )
          )
        }

        // done

        setStatus({ type: StatusType.Info, title: '', message: '' })
        setStarted(false)
        setEnded(true)

        // save to db

        const totalPayout = dbRecipients.reduce((prev, curr) => prev + curr.quantity, 0)
        const airdrop: Airdrop = {
          stakeKey,
          timestamp: Date.now(),

          tokenId: defaultData.tokenId,
          tokenName: defaultData.tokenName,
          tokenAmount: {
            decimals: defaultData.tokenAmount.decimals,
            onChain: totalPayout,
            display: formatTokenAmountFromChain(totalPayout, defaultData.tokenAmount.decimals),
          },
          thumb: defaultData.thumb,

          recipients: dbRecipients,
        }

        firestore
          .collection('airdrops')
          .add(airdrop)
          .then((doc) => console.log('Airdrop saved to Firestore', doc.id))
          .catch((error) => console.error('Error saving airdrop to Firestore:', error))

        api
          .notify('✅ Payout ended', `${stakeKey}\n${prettyNumber(defaultData.tokenAmount.display)} ${getTokenName(defaultData.tokenName)}`)
          .then()
          .catch()
      } catch (error: any) {
        const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

        if (errMsg?.indexOf('Maximum transaction size of') !== -1) {
          // Versions 1.7.0 - 1.8.14 of the Mesh SDK throw this error:
          // errMsg === `txBuildResult error: JsValue("Maximum transaction size of 16384 exceeded. Found: 19226")`

          // Older versions of the Mesh SDK throw this error:
          // errMsg === `[Transaction] An error occurred during build: Maximum transaction size of 16384 exceeded. Found: 21861.`

          const splitMessage: string[] = errMsg.split(' ')
          const [max, curr] = splitMessage.map((str) => Number(str.replace(/[^\d]/g, ''))).filter((num) => num && !isNaN(num))
          const newDifference = (prevDifference || 1) * (max / curr)
          batchSize = Math.floor(newDifference * unpayedWallets.length)

          return await runPayout(batchSize, newDifference)
        } else if (batchSize > 1) {
          return await runPayout(batchSize - 1)
        } else {
          setStatus({ type: StatusType.Error, title: '', message: errMsg })
          setProgress({ batch: { current: 0, max: 0 } })
          setStarted(false)
          api
            .notify(
              '❌ Payout failed',
              `${stakeKey}\n${prettyNumber(defaultData.tokenAmount.display)} ${getTokenName(defaultData.tokenName)}\n\n${errMsg}`
            )
            .then()
            .catch()
        }
      }
    },
    [defaultData, processedRecipients, devFee, wallet, stakeKey]
  )

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
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
      setStatus({ type: StatusType.Error, title: 'Error downloading receipt', message: errMsg })
    }
  }, [processedRecipients, defaultData, ticker])

  const [warn, setWarn] = useState({
    isOpen: false,
    stakeKey: '',
  })

  const rows = useMemo(
    () =>
      processedRecipients
        .sort((a, b) => {
          const aHasTx = !!a.txHash
          const bHasTx = !!b.txHash

          if (aHasTx && !bHasTx) return 1 // a goes after b
          if (!aHasTx && bHasTx) return -1 // a goes before b

          // If both have or both don't have txHash, sort by payout descending
          return b.payout - a.payout
        })
        .map((item) => {
          const isUnderMin = defaultData.tokenId === 'lovelace' && item.payout < MIN_LOVELACES_PER_WALLET
          const isPayed = !!item.txHash

          const status = isUnderMin ? StatusType.Error : isPayed ? StatusType.Success : StatusType.Info
          const statusText = isUnderMin
            ? `Below minim required amount (of ${ADA['SYMBOL']}${MIN_ADA_PER_WALLET})`
            : isPayed
            ? 'Payment Success'
            : 'Pending Payment'

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
                        <IconButton
                          withPing
                          pingColor={theme.colors.majestic_blue}
                          onClick={() => setWarn({ isOpen: true, stakeKey: item.stakeKey })}
                        >
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

  const serviceFee = useMemo(
    () => `${ADA['SYMBOL']}${prettyNumber(formatTokenAmountFromChain(devFee, ADA['DECIMALS'], false))} service fee`,
    [devFee]
  )

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

  const totalUnderMin = useMemo(() => {
    if (defaultData.tokenId !== 'lovelace') return { wallets: 0, amount: 0 }

    const filtered = processedRecipients.filter((item) => item.payout < MIN_LOVELACES_PER_WALLET)
    const reduced = filtered.reduce((prev, curr) => prev + (MIN_LOVELACES_PER_WALLET - curr.payout), 0)

    return { wallets: filtered.length, amount: reduced }
  }, [processedRecipients, defaultData])

  useEffect(() => {
    if (stakeKey) {
      api
        .notify('💡 Payout viewed', `${stakeKey}\n${prettyNumber(defaultData.tokenAmount.display)} ${getTokenName(defaultData.tokenName)}`)
        .then()
        .catch()
    }
  }, [stakeKey, defaultData])

  return (
    <>
      <FlexColumn $gap={16} style={{ width: '100%', alignItems: 'unset' }}>
        <SectionTitle
          title='Airdrop Payout'
          description={`${totalAmount} to airdrop • ${serviceFee} • ${processedRecipients.length - totalUnderMin.wallets}${
            !!totalUnderMin.wallets ? `/${processedRecipients.length}` : ''
          } wallets`}
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
                disabled={!ranPreFlightChecks || started || ended}
                onClick={() => {
                  api
                    .notify(
                      '⏳ Payout started',
                      `${stakeKey}\n${prettyNumber(defaultData.tokenAmount.display)} ${getTokenName(defaultData.tokenName)}`
                    )
                    .then()
                    .catch()

                  runPayout(0)
                }}
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
        {started && !ended ? (
          <div style={{ width: '100%' }}>
            <NotificationNote
              type={StatusType.Warning}
              title='Having issues?'
              message="ADA Drop isn't stable yet, you can use Bad Labs"
              action={{
                label: 'Go to Bad Labs',
                onClick: () => window.open('https://bad-labs.vercel.app/airdrops', '_blank', 'noopener,noreferrer'),
              }}
            />
          </div>
        ) : null}
        {ended && (
          <div style={{ width: '100%' }}>
            <NotificationNote type={StatusType.Success} title='Airdrop complete' message='You can download a copy of the receipt' />
          </div>
        )}
        {(!!status.title || !!status.message) && (
          <div style={{ width: '100%' }}>
            <NotificationNote type={status.type} title={status.title} message={status.message} />
          </div>
        )}
        {status.title === 'Insufficient recipients' && (
          <Button onClick={() => setWarn({ isOpen: true, stakeKey: '' })} variant='secondary' style={{ width: '100%', textDecoration: 'none' }}>
            <PlusIcon fill={theme.text.secondary} />
            <Text color={theme.text.secondary} family='secondary'>
              {`Round up to ${ADA['SYMBOL']}${MIN_ADA_PER_WALLET} for ${totalUnderMin.wallets} recipients`}
            </Text>
          </Button>
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
        title={`Round up to ${ADA['SYMBOL']}${MIN_ADA_PER_WALLET} ${warn.stakeKey ? 'for this wallet' : `for all ${totalUnderMin.wallets} wallets`}?`}
        description={warn.stakeKey}
        note={
          warn.isOpen
            ? {
                type: StatusType.Warning,
                title: '',
                message: `This will increase the total pool size by ${ADA['SYMBOL']}${formatTokenAmountFromChain(
                  warn.stakeKey
                    ? MIN_LOVELACES_PER_WALLET - (processedRecipients.find((x) => x.stakeKey === warn.stakeKey)?.payout || 0)
                    : totalUnderMin.amount,
                  ADA['DECIMALS'],
                  false
                )}!`,
              }
            : undefined
        }
        approveButton={{
          text: `Yes (${String.fromCodePoint(0x21b5)})`,
          variant: 'warning',
          onClick: () => {
            setProcessedRecipients((prev) =>
              prev.map((item) =>
                (!!warn.stakeKey && item.stakeKey === warn.stakeKey) || (!warn.stakeKey && item.payout < MIN_LOVELACES_PER_WALLET)
                  ? {
                      ...item,
                      payout: MIN_LOVELACES_PER_WALLET,
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
