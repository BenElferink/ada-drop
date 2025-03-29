import React, { type Dispatch, forwardRef, type SetStateAction } from 'react'
import { Blacklist } from '../steps/blacklist'
import { StakePools } from '../steps/stake-pools'
import { RunSnapshot } from '../steps/run-snapshot'
import { TokenSelector } from '../steps/token-selector'
import type { AirdropSettings, FormRef, PayoutRecipient } from '@/@types'

type Data = AirdropSettings

interface DelegatorsJourneyProps {
  step: number
  defaultData: Data
  payoutRecipients: PayoutRecipient[]
  setPayoutRecipients: Dispatch<SetStateAction<PayoutRecipient[]>>
}

export const DelegatorsJourney = forwardRef<FormRef<Data>, DelegatorsJourneyProps>(
  ({ step, defaultData, payoutRecipients, setPayoutRecipients }, ref) => {
    return step === 2 ? (
      <TokenSelector ref={ref} defaultData={defaultData} />
    ) : step === 3 ? (
      <StakePools ref={ref} defaultData={defaultData} />
    ) : step === 4 ? (
      <Blacklist ref={ref} defaultData={defaultData} />
    ) : step === 5 ? (
      <RunSnapshot ref={ref} defaultData={defaultData} payoutRecipients={payoutRecipients} setPayoutRecipients={setPayoutRecipients} />
    ) : null

    // : step === 6 ? (
    //   <AirdropPayout ref={ref} defaultData={defaultData} />
    // ) : null
  }
)

DelegatorsJourney.displayName = DelegatorsJourney.name
