import React, { forwardRef } from 'react'
import { Policies } from '../steps/policies'
import { TokenSelector } from '../steps/token-selector'
import type { AirdropSettings, FormRef } from '@/@types'

type Data = AirdropSettings

interface HoldersJourneyProps {
  step: number
  defaultData: Data
}

export const HoldersJourney = forwardRef<FormRef<Data>, HoldersJourneyProps>(({ step, defaultData }, ref) => {
  return step === 2 ? <TokenSelector ref={ref} defaultData={defaultData} /> : step === 3 ? <Policies ref={ref} defaultData={defaultData} /> : null

  // ) : step ===5 ? (
  //   <StakePools ref={ref} defaultData={defaultData} />
  // ) : step === 6 ? (
  //   <HolderBlacklist ref={ref} defaultData={defaultData} />
  // ) : step === 7 ? (
  //   <AirdropSnapshot ref={ref} defaultData={defaultData} />
  // ) : step === 8 ? (
  //   <AirdropPayout ref={ref} defaultData={defaultData} />
  // ) : null
})

HoldersJourney.displayName = HoldersJourney.name
