import React, { type FC } from 'react'
import type { AirdropSettings } from '@/@types'
import { FlexColumn, Text } from '@odigos/ui-kit/components'

type Data = Partial<AirdropSettings>

interface CustomListJourneyProps {
  step: number
  defaultData: Data
  callback: (payload: Data) => void
}

export const CustomListJourney: FC<CustomListJourneyProps> = ({ step, defaultData }) => {
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
