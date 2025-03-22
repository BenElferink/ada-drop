import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Selected } from '@/components'
import { DataTab } from '@odigos/ui-kit/components'
import { AirdropMethodType, type FormRef, type AirdropSettings } from '@/@types'

type Data = Pick<AirdropSettings, 'airdropMethod'>

interface AirdropMethodProps {
  defaultData: Data
}

export const AirdropMethod = forwardRef<FormRef<Data>, AirdropMethodProps>(({ defaultData }, ref) => {
  const [data, setData] = useState(defaultData)

  useImperativeHandle(ref, () => ({
    getData: () => data,
    validate: () =>
      Promise.resolve({
        isOk: !!data.airdropMethod,
        message: 'Please select an airdrop method',
      }),
  }))

  return (
    <>
      <DataTab
        title={AirdropMethodType.HolderSnapshot}
        subTitle="You'll be asked to provide Policy IDs, we'll handle the snapshot."
        onClick={() => setData(() => ({ airdropMethod: AirdropMethodType.HolderSnapshot }))}
        onCheckboxChange={(bool) => setData(() => ({ airdropMethod: bool ? AirdropMethodType.HolderSnapshot : AirdropMethodType.EMPTY }))}
        withCheckbox
        isChecked={data['airdropMethod'] === AirdropMethodType.HolderSnapshot}
        renderActions={data['airdropMethod'] === AirdropMethodType.HolderSnapshot ? Selected : undefined}
      />

      <DataTab
        title={AirdropMethodType.DelegatorSnapshot}
        subTitle="You'll be asked to provide Stake Pool IDs, we'll handle the snapshot."
        onClick={() => setData(() => ({ airdropMethod: AirdropMethodType.DelegatorSnapshot }))}
        onCheckboxChange={(bool) => setData(() => ({ airdropMethod: bool ? AirdropMethodType.DelegatorSnapshot : AirdropMethodType.EMPTY }))}
        withCheckbox
        isChecked={data['airdropMethod'] === AirdropMethodType.DelegatorSnapshot}
        renderActions={data['airdropMethod'] === AirdropMethodType.DelegatorSnapshot ? Selected : undefined}
      />

      <DataTab
        title={AirdropMethodType.CustomList}
        subTitle='You already have a list of recipients, skip the snapshot.'
        onClick={() => setData(() => ({ airdropMethod: AirdropMethodType.CustomList }))}
        onCheckboxChange={(bool) => setData(() => ({ airdropMethod: bool ? AirdropMethodType.CustomList : AirdropMethodType.EMPTY }))}
        withCheckbox
        isChecked={data['airdropMethod'] === AirdropMethodType.CustomList}
        renderActions={data['airdropMethod'] === AirdropMethodType.CustomList ? Selected : undefined}
      />
    </>
  )
})

AirdropMethod.displayName = AirdropMethod.name
