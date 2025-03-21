import React, { forwardRef } from 'react'
import { TokenSelector } from '../steps/token-selector'
import type { AirdropSettings, FormRef } from '@/@types'

type Data = AirdropSettings

interface DelegatorsJourneyProps {
  step: number
  defaultData: Data
}

export const DelegatorsJourney = forwardRef<FormRef<Data>, DelegatorsJourneyProps>(({ step, defaultData }, ref) => {
  return step === 2 ? <TokenSelector ref={ref} defaultData={defaultData} /> : null
})

DelegatorsJourney.displayName = DelegatorsJourney.name
