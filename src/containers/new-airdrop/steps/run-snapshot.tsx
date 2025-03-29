import { type Dispatch, forwardRef, type SetStateAction, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { DownloadIcon } from '@/icons'
import Theme from '@odigos/ui-kit/theme'
import { ProgressBar } from '@/components'
import { utils, writeFileXLSX } from 'xlsx'
import { StatusType } from '@odigos/ui-kit/types'
import { formatTokenAmountFromChain } from '@/functions'
import type { AirdropSettings, FormRef, PayoutRecipient } from '@/@types'
import { runSnapshot, type ProgressCounts } from '../helpers/run-snapshot'
import { Button, Divider, FlexColumn, NotificationNote, SectionTitle, Text } from '@odigos/ui-kit/components'

type Data = AirdropSettings

interface RunSnapshotProps {
  defaultData: Data
  payoutRecipients: PayoutRecipient[]
  setPayoutRecipients: Dispatch<SetStateAction<PayoutRecipient[]>>
}

export const RunSnapshot = forwardRef<FormRef<Data>, RunSnapshotProps>(({ defaultData, payoutRecipients, setPayoutRecipients }, ref) => {
  const theme = Theme.useTheme()

  const [errorMessage, setErrorMessage] = useState('')
  const [snapshotEnded, setSnapshotEnded] = useState(!!payoutRecipients.length)
  const [progress, setProgress] = useState<ProgressCounts>({
    policy: {
      current: !!payoutRecipients.length ? defaultData.policies.length || 0 : 0,
      max: defaultData.policies.length || 0,
    },
    token: {
      current: 0,
      max: 0,
    },
    holder: {
      current: 0,
      max: 0,
    },
    pool: {
      current: !!payoutRecipients.length ? defaultData.stakePools.length || 0 : 0,
      max: defaultData.stakePools.length || 0,
    },
    delegator: {
      current: 0,
      max: 0,
    },
  })

  useImperativeHandle(ref, () => ({
    getData: () => defaultData,
    validate: () => {
      if (!snapshotEnded) setErrorMessage('Snapshot is still running, please wait until it ends')
      return Promise.resolve(snapshotEnded)
    },
  }))

  const runRef = useRef(false)
  useEffect(() => {
    if (!!payoutRecipients.length || runRef.current) return
    runRef.current = true

    runSnapshot(defaultData, setProgress)
      .then((recipients) => {
        setPayoutRecipients(recipients)
        setSnapshotEnded(true)
        setErrorMessage('')
      })
      .catch((error) => {
        const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
        console.error('ERROR running snapshot:\n', `${errMsg}\n`, error)
        setErrorMessage(errMsg)
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payoutRecipients])

  const downloadSnapshot = useCallback(() => {
    try {
      const wb = utils.book_new()
      const ws = utils.json_to_sheet(
        payoutRecipients.map((item) => ({
          amount: formatTokenAmountFromChain(item.payout, defaultData.tokenAmount.decimals),
          tokenName: defaultData.tokenName.ticker || defaultData.tokenName.display || defaultData.tokenName.onChain,
          address: item.address,
          stakeKey: item.stakeKey,
        })),
        { header: ['amount', 'tokenName', 'address', 'stakeKey'] }
      )

      ws['!cols'] = [{ width: 20 }, { width: 15 }, { width: 100 }, { width: 70 }]
      utils.book_append_sheet(wb, ws, 'snapshot')

      writeFileXLSX(wb, `ADA Drop - snapshot (${new Date().toLocaleDateString()}).xlsx`)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
      console.error('ERROR downloading snapshot:\n', `${errMsg}\n`, error)
      setErrorMessage(errMsg)
    }
  }, [payoutRecipients, defaultData])

  return (
    <>
      <FlexColumn $gap={16} style={{ width: '100%', alignItems: 'unset' }}>
        <SectionTitle
          title='Snapshot'
          description={snapshotEnded ? '' : "We're collecting on-chain data, in the meantime just sit back & enjoy 🍺"}
          actionButton={
            snapshotEnded && (
              <Button variant='tertiary' onClick={downloadSnapshot} style={{ textDecoration: 'none' }}>
                <DownloadIcon size={24} fill={theme.text.success} />
                <Text color={theme.text.success} family='secondary'>
                  Download Copy
                </Text>
              </Button>
            )
          }
        />
        <div style={{ width: '100%' }}>
          {snapshotEnded ? (
            <NotificationNote
              type={StatusType.Success}
              title='Done'
              message='you can download a copy of this snapshot, or just proceed to the next step'
            />
          ) : (
            <NotificationNote type={StatusType.Info} title='"Script" wallets not included, for example:' message='jpg.store, Mutant Labs, etc.' />
          )}
        </div>
        {errorMessage && (
          <div style={{ width: '100%' }}>
            <NotificationNote type={StatusType.Error} message={errorMessage} />
          </div>
        )}
        <Divider />
      </FlexColumn>

      {progress.policy?.max ? <ProgressBar label='Policy IDs' max={progress.policy.max} current={progress.policy.current} /> : null}
      {progress.token?.max ? <ProgressBar label='Asset IDs' max={progress.token.max} current={progress.token.current} /> : null}
      {progress.holder?.max ? <ProgressBar label='Asset Holders' max={progress.holder.max} current={progress.holder.current} /> : null}

      {progress.pool?.max ? <ProgressBar label='Stake Pools' max={progress.pool.max} current={progress.pool.current} /> : null}
      {progress.delegator?.max ? <ProgressBar label='Pool Delegators' max={progress.delegator.max} current={progress.delegator.current} /> : null}
    </>
  )
})

RunSnapshot.displayName = RunSnapshot.name
