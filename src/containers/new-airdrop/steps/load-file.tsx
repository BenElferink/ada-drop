import React, { type Dispatch, forwardRef, type SetStateAction, useImperativeHandle, useRef, useState } from 'react'
import api from '@/utils/api'
import { read, utils } from 'xlsx'
import { UploadIcon } from '@/icons'
import Theme from '@odigos/ui-kit/theme'
import { ProgressBar } from '@/components'
import { useConnectedWallet } from '@/hooks'
import { StatusType } from '@odigos/ui-kit/types'
import type { AirdropSettings, FormRef, PayoutRecipient } from '@/@types'
import { formatTokenAmountFromChain, formatTokenAmountToChain } from '@/functions'
import { Button, Divider, FlexColumn, InteractiveTable, NotificationNote, SectionTitle, Text } from '@odigos/ui-kit/components'

type Data = AirdropSettings

interface LoadFileProps {
  defaultData: Data
  payoutRecipients: PayoutRecipient[]
  setPayoutRecipients: Dispatch<SetStateAction<PayoutRecipient[]>>
}

export const LoadFile = forwardRef<FormRef<Data>, LoadFileProps>(({ defaultData, payoutRecipients, setPayoutRecipients }, ref) => {
  const theme = Theme.useTheme()
  const { tokens } = useConnectedWallet()

  const [errorMessage, setErrorMessage] = useState('')
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [progress, setProgress] = useState({
    row: {
      current: 0,
      max: 0,
    },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    getData: () => defaultData,
    validate: async () => {
      let isOk = true

      if (started) {
        isOk = false
        setErrorMessage('File is still loading, please wait until it ends')
      } else if (!payoutRecipients.length) {
        isOk = false
        setErrorMessage('Please upload a valid file')
      }

      return Promise.resolve(isOk)
    },
  }))

  const clearAfterError = () => {
    setStarted(false)
    setEnded(false)
    setProgress({
      row: {
        current: 0,
        max: 0,
      },
    })
  }

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setStarted(true)
    setErrorMessage('')

    const file = event.target.files?.[0]
    if (!file) {
      clearAfterError()
      return
    }

    try {
      const buffer = await file.arrayBuffer()
      const wb = read(buffer, { type: 'buffer' })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: Record<string, any>[] = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      const payload: PayoutRecipient[] = []
      let totalAmountOnChain = 0

      for (const rowObj of rows) {
        const payoutWallet: Partial<PayoutRecipient> = {}
        const goodKeyCount = 2
        let keyCount = 0

        for await (const [objKey, keyVal] of Object.entries(rowObj)) {
          const key = objKey.trim().toLowerCase()

          if (['wallet', 'amount'].includes(key)) {
            if (key === 'amount') {
              // remove all non-digit characters
              const n = typeof keyVal === 'string' ? Number(keyVal.replace(/[^\d]/g, '')) : (keyVal as number)
              if (isNaN(n)) {
                setErrorMessage(`Bad file! Detected invalid value(s) for "amount" field.\n\nValue was: ${keyVal}`)
                clearAfterError()
                return
              }

              const amountOnChain = formatTokenAmountToChain(n, defaultData.tokenAmount.decimals)
              payoutWallet['payout'] = amountOnChain
              keyCount++
              totalAmountOnChain += amountOnChain
            }

            if (key === 'wallet') {
              try {
                const { stakeKey, addresses } = await api.wallet.getData(keyVal)

                if (addresses[0].address.indexOf('addr1') !== 0) {
                  setErrorMessage(`Bad file! Address is not on Cardano.\n\nValue was: ${addresses[0].address}`)
                  clearAfterError()
                  return
                } else if (addresses[0].isScript) {
                  // TODO: undo this and ignore ??
                  setErrorMessage(`Bad file! Address is a Script or Contract.\n\nValue was: ${addresses[0].address}`)
                  clearAfterError()
                  return
                } else if (!stakeKey) {
                  // TODO: undo this and rely on an address ??
                  setErrorMessage(`Bad file! Address has no registered Stake Key.\n\nValue was: ${addresses[0].address}`)
                  clearAfterError()
                  return
                } else {
                  payoutWallet['address'] = addresses[0].address
                  payoutWallet['stakeKey'] = stakeKey
                  payoutWallet['txHash'] = ''
                  keyCount++
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (error: any) {
                const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
                console.error('ERROR:\n', `${errMsg}\n`, error)
                setErrorMessage(errMsg)
                clearAfterError()
                return
              }
            }
          }
        }

        if (keyCount < goodKeyCount) {
          setErrorMessage('Bad file! Detected row(s) with missing value(s).')
          clearAfterError()
          return
        }

        payload.push(payoutWallet as PayoutRecipient)

        setProgress((prev) => ({
          ...prev,
          row: { ...prev.row, current: prev.row.current + 1, max: rows.length },
        }))
      }

      const userOwnedOnChain = tokens.find((t) => t.tokenId === defaultData.tokenId)?.tokenAmount.onChain || 0

      if (totalAmountOnChain > userOwnedOnChain) {
        setErrorMessage(
          `Woopsies! The total amount on-file (${formatTokenAmountFromChain(
            totalAmountOnChain,
            defaultData.tokenAmount.decimals
          )}), is greater than the amount you own (${formatTokenAmountFromChain(userOwnedOnChain, defaultData.tokenAmount.decimals)}).`
        )
        clearAfterError()
        return
      }

      setPayoutRecipients(payload)
      setEnded(!!payload.length)
      setStarted(false)
      setErrorMessage('')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'
      console.error('ERROR:\n', `${errMsg}\n`, error)
      setErrorMessage(errMsg)
      clearAfterError()
      return
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
              <Button variant='tertiary' disabled={started || ended} onClick={() => fileInputRef.current?.click()} style={{ textDecoration: 'none' }}>
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
          {ended ? (
            <NotificationNote type={StatusType.Success} title='Done' message='you can proceed to the next step' />
          ) : !started && !ended ? (
            <NotificationNote type={StatusType.Info} title='The columns must be named "Amount" and "Wallet":' />
          ) : (
            <NotificationNote type={StatusType.Info} title='"Script" wallets not included, for example:' message='jpg.store, Mutant Labs, etc.' />
          )}
        </div>
        {!!errorMessage && (
          <div style={{ width: '100%' }}>
            <NotificationNote type={StatusType.Error} title={errorMessage} />
          </div>
        )}
        {(started || ended) && <Divider />}
      </FlexColumn>

      {!started && !ended ? (
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
      ) : (
        <ProgressBar label='File Rows' max={progress.row.max} current={progress.row.current} />
      )}
    </>
  )
})

LoadFile.displayName = LoadFile.name
