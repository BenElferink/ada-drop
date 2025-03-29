import React, { forwardRef } from 'react'
import { Policies } from '../steps/policies'
import { Blacklist } from '../steps/blacklist'
import { TokenSelector } from '../steps/token-selector'
import type { AirdropSettings, FormRef } from '@/@types'

type Data = AirdropSettings

interface HoldersJourneyProps {
  step: number
  defaultData: Data
}

export const HoldersJourney = forwardRef<FormRef<Data>, HoldersJourneyProps>(({ step, defaultData }, ref) => {
  return step === 2 ? (
    <TokenSelector ref={ref} defaultData={defaultData} />
  ) : step === 3 ? (
    <Policies ref={ref} defaultData={defaultData} />
  ) : step === 4 ? (
    <Blacklist ref={ref} defaultData={defaultData} />
  ) : null

  // ) : step === 5 ? (
  //   <AirdropSnapshot ref={ref} defaultData={defaultData} />
  // ) : step === 6 ? (
  //   <AirdropPayout ref={ref} defaultData={defaultData} />
  // ) : null
})

HoldersJourney.displayName = HoldersJourney.name
