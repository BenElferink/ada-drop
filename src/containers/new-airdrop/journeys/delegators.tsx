import React, { type FC } from 'react'
import type { AirdropSettings } from '@/@types'
import { FlexColumn, Text } from '@odigos/ui-kit/components'

type Data = Partial<AirdropSettings>

interface DelegatorsJourneyProps {
  step: number
  defaultData: Data
  callback: (payload: Data) => void
}

export const DelegatorsJourney: FC<DelegatorsJourneyProps> = ({ step, defaultData }) => {
  return (
    <FlexColumn>
      <Text>
        {defaultData.airdropMethod}
        <br />
        Step: {step}
      </Text>
    </FlexColumn>
  )
}
