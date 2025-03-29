import React, { forwardRef } from 'react'
import { Blacklist } from '../steps/blacklist'
import { StakePools } from '../steps/stake-pools'
import { TokenSelector } from '../steps/token-selector'
import type { AirdropSettings, FormRef } from '@/@types'

type Data = AirdropSettings

interface DelegatorsJourneyProps {
  step: number
  defaultData: Data
}

export const DelegatorsJourney = forwardRef<FormRef<Data>, DelegatorsJourneyProps>(({ step, defaultData }, ref) => {
  return step === 2 ? (
    <TokenSelector ref={ref} defaultData={defaultData} />
  ) : step === 3 ? (
    <StakePools ref={ref} defaultData={defaultData} />
  ) : step === 4 ? (
    <Blacklist ref={ref} defaultData={defaultData} />
  ) : null

  // ) : step === 5 ? (
  //   <AirdropSnapshot ref={ref} defaultData={defaultData} />
  // ) : step === 6 ? (
  //   <AirdropPayout ref={ref} defaultData={defaultData} />
  // ) : null
})

DelegatorsJourney.displayName = DelegatorsJourney.name
