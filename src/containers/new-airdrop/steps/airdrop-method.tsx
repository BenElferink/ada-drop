import React, { type FC, useEffect, useState } from 'react'
import { Selected } from '@/components'
import { DataTab, FlexColumn } from '@odigos/ui-kit/components'
import { AirdropMethodType, type AirdropSettings } from '@/@types'

type Data = Pick<AirdropSettings, 'airdropMethod'>

interface AirdropMethodProps {
  defaultData: Data
  callback: (payload: Data) => void
}

export const AirdropMethod: FC<AirdropMethodProps> = ({ defaultData, callback }) => {
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    if (Object.keys(data).length) callback(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <FlexColumn $gap={16}>
      <DataTab
        title={AirdropMethodType.HolderSnapshot}
        subTitle="You'll be asked to provide Policy IDs, we'll handle the snapshot."
        onClick={() => setData(() => ({ airdropMethod: AirdropMethodType.HolderSnapshot }))}
        withCheckbox
        isChecked={data['airdropMethod'] === AirdropMethodType.HolderSnapshot}
        renderActions={data['airdropMethod'] === AirdropMethodType.HolderSnapshot ? Selected : undefined}
      />

      <DataTab
        title={AirdropMethodType.DelegatorSnapshot}
        subTitle="You'll be asked to provide Stake Pool IDs, we'll handle the snapshot."
        onClick={() => setData(() => ({ airdropMethod: AirdropMethodType.DelegatorSnapshot }))}
        withCheckbox
        isChecked={data['airdropMethod'] === AirdropMethodType.DelegatorSnapshot}
        renderActions={data['airdropMethod'] === AirdropMethodType.DelegatorSnapshot ? Selected : undefined}
      />

      <DataTab
        title={AirdropMethodType.CustomList}
        subTitle='You already have a list of recipients, skip the snapshot.'
        onClick={() => setData(() => ({ airdropMethod: AirdropMethodType.CustomList }))}
        withCheckbox
        isChecked={data['airdropMethod'] === AirdropMethodType.CustomList}
        renderActions={data['airdropMethod'] === AirdropMethodType.CustomList ? Selected : undefined}
      />
    </FlexColumn>
  )
}
