import React, { forwardRef } from 'react'
import { TokenSelector } from '../steps/token-selector'
import type { AirdropSettings, FormRef } from '@/@types'

type Data = AirdropSettings

interface CustomListJourneyProps {
  step: number
  defaultData: Data
}

export const CustomListJourney = forwardRef<FormRef<Data>, CustomListJourneyProps>(({ step, defaultData }, ref) => {
  return step === 2 ? <TokenSelector ref={ref} defaultData={defaultData} /> : null
})

CustomListJourney.displayName = CustomListJourney.name
