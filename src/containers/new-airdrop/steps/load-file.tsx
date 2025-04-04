import React, { type Dispatch, forwardRef, type SetStateAction, useImperativeHandle, useRef, useState } from 'react'
import api from '@/utils/api'
import { read, utils } from 'xlsx'
import { UploadIcon } from '@/icons'
import Theme from '@odigos/ui-kit/theme'
import { ProgressBar } from '@/components'
import { StatusType } from '@odigos/ui-kit/types'
import { formatTokenAmountToChain } from '@/functions'
import { getStatusIcon } from '@odigos/ui-kit/functions'
import type { AirdropSettings, FormRef, PayoutRecipient } from '@/@types'
import { Button, Divider, FlexColumn, InteractiveTable, NotificationNote, SectionTitle, Text } from '@odigos/ui-kit/components'

type Data = AirdropSettings

interface LoadFileProps {
  defaultData: Data
  payoutRecipients: PayoutRecipient[]
  setPayoutRecipients: Dispatch<SetStateAction<PayoutRecipient[]>>
}

export const LoadFile = forwardRef<FormRef<Data>, LoadFileProps>(({ defaultData, payoutRecipients, setPayoutRecipients }, ref) => {
  const theme = Theme.useTheme()

  const [fileErrors, setFileErrors] = useState<{ row: number; type: StatusType; message: string; origin: string }[]>([])
  const [status, setStatus] = useState({ type: StatusType.Info, title: '', message: '' })
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState({ row: { current: 0, max: 0 } })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    getData: () => defaultData,
    validate: async () => {
      let isOk = status.type !== StatusType.Error

      if (isOk && !!fileErrors.length) {
        isOk = false
        setStatus({ type: StatusType.Warning, title: '', message: 'Please fix the errors in the file' })
      }
      if (isOk && started) {
        isOk = false
        setStatus({ type: StatusType.Warning, title: '', message: 'File is still loading, please wait until it ends' })
      }
      if (isOk && (!payoutRecipients.length || !ended)) {
        isOk = false
        setStatus({ type: StatusType.Warning, title: '', message: 'Please upload a file' })
      }

      return Promise.resolve(isOk)
    },
  }))

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setPayoutRecipients([])
    setFileErrors([])
    setStarted(true)
    setEnded(false)
    setStatus({ type: StatusType.Info, title: '', message: '' })
    setProgress({ row: { current: 0, max: 0 } })

    try {
      const buffer = await file.arrayBuffer()
      const wb = read(buffer, { type: 'buffer' })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: Record<string, any>[] = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      const payload: PayoutRecipient[] = []

      const walletKeys = ['wallet', 'address', 'stakekey', 'stake-key', 'stake key', 'handle', 'adahandle', 'ada-handle', 'ada handle']
      const amountKeys = ['amount']

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const detectedKeys = { wallet: false, amount: false }
        const payoutWallet: PayoutRecipient = { stakeKey: '', address: '', txHash: '', payout: 0 }

        for await (const [objKey, keyVal] of Object.entries(row)) {
          const key = objKey?.toString().trim().toLowerCase()
          const val = keyVal?.toString().trim()

          if (walletKeys.concat(amountKeys).includes(key)) {
            if (amountKeys.includes(key) && !detectedKeys['amount']) {
              detectedKeys['amount'] = true

              const n = Number(
                val
                  .replace(/[^\d.]/g, '') // remove everything except digits and dots
                  .replace(/^\.*/g, '') // remove leading dots
                  .replace(/\.{2,}/g, '.') // collapse multiple dots
                  .replace(/(\..*)\./g, '$1') // keep only the first dot
              )

              if (isNaN(n) || n <= 0) {
                setFileErrors((prev) => [...prev, { row: i + 1, type: StatusType.Error, message: 'Amount is invalid', origin: val }])
              } else {
                const amountOnChain = formatTokenAmountToChain(n, defaultData.tokenAmount.decimals)
                payoutWallet['payout'] = amountOnChain
              }
            }

            if (walletKeys.includes(key) && !detectedKeys['wallet']) {
              detectedKeys['wallet'] = true

              try {
                const { stakeKey, addresses } = await api.wallet.getData(val)

                if (addresses[0].address.indexOf('addr1') !== 0) {
                  setFileErrors((prev) => [
                    ...prev,
                    { row: i + 1, type: StatusType.Error, message: 'Address is not on Cardano', origin: addresses[0].address },
                  ])
                } else if (addresses[0].isScript) {
                  // !! ignore script wallets
                } else if (!stakeKey) {
                  // TODO: undo this and rely on an address ??
                  setFileErrors((prev) => [
                    ...prev,
                    { row: i + 1, type: StatusType.Error, message: 'Address has no registered Stake Key', origin: addresses[0].address },
                  ])
                } else {
                  payoutWallet['address'] = addresses[0].address
                  payoutWallet['stakeKey'] = stakeKey
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (error: any) {
                const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
                setFileErrors((prev) => [
                  ...prev,
                  {
                    row: i + 1,
                    type: StatusType.Error,
                    message: errMsg.includes('provide a valid wallet') ? 'Invalid wallet identifier' : errMsg,
                    origin: val,
                  },
                ])
              }
            }
          }
        }

        if (!detectedKeys['wallet'] || !detectedKeys['amount']) {
          setFileErrors((prev) => [
            ...prev,
            {
              row: i + 1,
              type: StatusType.Error,
              message: 'Row is missing required columns',
              origin:
                (!detectedKeys['wallet'] ? 'wallet' : '') +
                (!detectedKeys['wallet'] && !detectedKeys['amount'] ? ' & ' : '') +
                (!detectedKeys['amount'] ? 'amount' : ''),
            },
          ])
        }

        payload.push(payoutWallet)
        setProgress((prev) => ({
          ...prev,
          row: { ...prev.row, current: prev.row.current + 1, max: rows.length },
        }))
      }

      setPayoutRecipients(payload.filter(({ payout }) => !!payout).sort((a, b) => b.payout - a.payout))
      setStarted(false)
      setEnded(true)
      setStatus({ type: StatusType.Info, title: '', message: '' })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
      setStarted(false)
      setEnded(false)
      setStatus({ type: StatusType.Error, title: 'Error loading file', message: errMsg })
      setProgress({ row: { current: 0, max: 0 } })
    }
  }

  return (
    <>
      <FlexColumn $gap={16} style={{ width: '100%', alignItems: 'unset' }}>
        <SectionTitle
          title='Upload File'
          description='Load an Excel Spreadsheet with receiving wallets'
          actionButton={
            <>
              <Button
                variant='tertiary'
                disabled={started || (ended && !fileErrors.length)}
                onClick={() => fileInputRef.current?.click()}
                style={{ textDecoration: 'none' }}
              >
                <UploadIcon size={24} fill={theme.text.info} />
                <Text color={theme.text.info} family='secondary'>
                  Upload File
                </Text>
              </Button>

              <input ref={fileInputRef} type='file' accept='.xlsx, .xls' multiple={false} onChange={handleFile} style={{ display: 'none' }} />
            </>
          }
        />
        <div style={{ width: '100%' }}>
          {!started && !ended ? (
            <NotificationNote type={StatusType.Info} title='The columns must be named "Amount" and "Wallet"' />
          ) : started ? (
            <NotificationNote type={StatusType.Info} title='"Script" wallets not included, for example:' message='jpg.store, Mutant Labs, etc.' />
          ) : ended && status.type !== StatusType.Error && !fileErrors.length ? (
            <NotificationNote type={StatusType.Success} title='File loaded successfully' message='You can proceed to the next step' />
          ) : null}
        </div>
        {(!!status.title || !!status.message) && (
          <div style={{ width: '100%' }}>
            <NotificationNote type={status.type} title={status.title} message={status.message} />
          </div>
        )}
        {(started || (ended && !fileErrors.length)) && <Divider />}
      </FlexColumn>

      {started || (ended && !fileErrors.length) ? (
        <ProgressBar label='File Rows' max={progress.row.max} current={progress.row.current} />
      ) : !started && !ended ? (
        <div style={{ width: '100%' }}>
          <InteractiveTable
            columns={[
              { key: 'amount', title: 'Amount' },
              { key: 'wallet', title: 'Wallet' },
            ]}
            rows={[
              {
                cells: [
                  { columnKey: 'amount', value: '11' },
                  { columnKey: 'wallet', value: 'addr1... / stake1... / $handle' },
                ],
              },
              {
                cells: [
                  { columnKey: 'amount', value: '420.69' },
                  { columnKey: 'wallet', value: 'addr1... / stake1... / $handle' },
                ],
              },
              {
                cells: [
                  { columnKey: 'amount', value: '555,555.5' },
                  { columnKey: 'wallet', value: 'addr1... / stake1... / $handle' },
                ],
              },
            ]}
          />
        </div>
      ) : null}

      {!!fileErrors.length && (
        <div style={{ width: '100%' }}>
          <InteractiveTable
            columns={[
              { key: 'status', title: '' },
              { key: 'row', title: 'File Row' },
              { key: 'msg', title: 'Problem' },
              { key: 'src', title: 'Value' },
            ]}
            rows={fileErrors.map((e) => ({
              status: e.type,
              cells: [
                { columnKey: 'status', icon: getStatusIcon(e.type, theme) },
                { columnKey: 'row', value: e.row },
                { columnKey: 'msg', value: e.message + ':' },
                { columnKey: 'src', value: e.origin },
              ],
            }))}
          />
        </div>
      )}
    </>
  )
})

LoadFile.displayName = LoadFile.name
