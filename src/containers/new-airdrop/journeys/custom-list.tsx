import React, { type Dispatch, forwardRef, type SetStateAction } from 'react'
import { LoadFile } from '../steps/load-file'
import { RunPayout } from '../steps/run-payout'
import { TokenSelector } from '../steps/token-selector'
import type { AirdropSettings, FormRef, PayoutRecipient } from '@/@types'

type Data = AirdropSettings

interface CustomListJourneyProps {
  step: number
  defaultData: Data
  payoutRecipients: PayoutRecipient[]
  setPayoutRecipients: Dispatch<SetStateAction<PayoutRecipient[]>>
}

export const CustomListJourney = forwardRef<FormRef<Data>, CustomListJourneyProps>(
  ({ step, defaultData, payoutRecipients, setPayoutRecipients }, ref) => {
    return step === 2 ? (
      <TokenSelector ref={ref} defaultData={defaultData} />
    ) : step === 3 ? (
      <LoadFile ref={ref} defaultData={defaultData} payoutRecipients={payoutRecipients} setPayoutRecipients={setPayoutRecipients} />
    ) : step === 4 ? (
      <RunPayout ref={ref} defaultData={defaultData} payoutRecipients={payoutRecipients} />
    ) : null
  }
)

CustomListJourney.displayName = CustomListJourney.name
