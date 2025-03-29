import React, { type Dispatch, forwardRef, type SetStateAction } from 'react'
import { Policies } from '../steps/policies'
import { Blacklist } from '../steps/blacklist'
import { RunSnapshot } from '../steps/run-snapshot'
import { TokenSelector } from '../steps/token-selector'
import type { AirdropSettings, FormRef, PayoutRecipient } from '@/@types'

type Data = AirdropSettings

interface HoldersJourneyProps {
  step: number
  defaultData: Data
  payoutRecipients: PayoutRecipient[]
  setPayoutRecipients: Dispatch<SetStateAction<PayoutRecipient[]>>
}

export const HoldersJourney = forwardRef<FormRef<Data>, HoldersJourneyProps>(({ step, defaultData, payoutRecipients, setPayoutRecipients }, ref) => {
  return step === 2 ? (
    <TokenSelector ref={ref} defaultData={defaultData} />
  ) : step === 3 ? (
    <Policies ref={ref} defaultData={defaultData} />
  ) : step === 4 ? (
    <Blacklist ref={ref} defaultData={defaultData} />
  ) : step === 5 ? (
    <RunSnapshot ref={ref} defaultData={defaultData} payoutRecipients={payoutRecipients} setPayoutRecipients={setPayoutRecipients} />
  ) : null

  // : step === 6 ? (
  //   <AirdropPayout ref={ref} defaultData={defaultData} />
  // ) : null
})

HoldersJourney.displayName = HoldersJourney.name
