import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { Selected } from '@/components'
import Theme from '@odigos/ui-kit/theme'
import { StatusType } from '@odigos/ui-kit/types'
import { DataTab, NotificationNote } from '@odigos/ui-kit/components'
import { AirdropMethodType, type FormRef, type AirdropSettings } from '@/@types'

type Data = Pick<AirdropSettings, 'airdropMethod'>

interface AirdropMethodProps {
  defaultData: Data
}

export const AirdropMethod = forwardRef<FormRef<Data>, AirdropMethodProps>(({ defaultData }, ref) => {
  const theme = Theme.useTheme()
  const [data, setData] = useState(defaultData)
  const [errors, setErrors] = useState({ message: '' })

  useImperativeHandle(ref, () => ({
    getData: () => data,
    validate: () => {
      const isOk = !!data.airdropMethod

      if (isOk) {
        setErrors({ message: '' })
        return Promise.resolve(true)
      } else {
        setErrors({ message: 'Please select an airdrop method' })
        return Promise.resolve(false)
      }
    },
  }))

  return (
    <>
      {!!errors.message && (
        <div style={{ width: '100%' }}>
          <NotificationNote type={StatusType.Error} title={errors.message} />
        </div>
      )}

      <DataTab
        title={AirdropMethodType.HolderSnapshot}
        subTitle="You'll be asked to provide Policy IDs, we'll handle the snapshot."
        onClick={() => setData(() => ({ airdropMethod: AirdropMethodType.HolderSnapshot }))}
        checkboxProps={{
          withCheckbox: true,
          isChecked: data['airdropMethod'] === AirdropMethodType.HolderSnapshot,
          onCheckboxChange: (bool) => setData(() => ({ airdropMethod: bool ? AirdropMethodType.HolderSnapshot : AirdropMethodType.EMPTY })),
        }}
        visualProps={{
          bgColor: data['airdropMethod'] === AirdropMethodType.HolderSnapshot ? theme.colors.majestic_blue + Theme.opacity.hex['030'] : undefined,
          bgColorHover:
            data['airdropMethod'] === AirdropMethodType.HolderSnapshot ? theme.colors.majestic_blue + Theme.opacity.hex['040'] : undefined,
        }}
        renderActions={data['airdropMethod'] === AirdropMethodType.HolderSnapshot ? Selected : undefined}
      />

      <DataTab
        title={AirdropMethodType.DelegatorSnapshot}
        subTitle="You'll be asked to provide Stake Pool IDs, we'll handle the snapshot."
        onClick={() => setData(() => ({ airdropMethod: AirdropMethodType.DelegatorSnapshot }))}
        checkboxProps={{
          withCheckbox: true,
          isChecked: data['airdropMethod'] === AirdropMethodType.DelegatorSnapshot,
          onCheckboxChange: (bool) => setData(() => ({ airdropMethod: bool ? AirdropMethodType.DelegatorSnapshot : AirdropMethodType.EMPTY })),
        }}
        visualProps={{
          bgColor: data['airdropMethod'] === AirdropMethodType.DelegatorSnapshot ? theme.colors.majestic_blue + Theme.opacity.hex['030'] : undefined,
          bgColorHover:
            data['airdropMethod'] === AirdropMethodType.DelegatorSnapshot ? theme.colors.majestic_blue + Theme.opacity.hex['040'] : undefined,
        }}
        renderActions={data['airdropMethod'] === AirdropMethodType.DelegatorSnapshot ? Selected : undefined}
      />

      <DataTab
        title={AirdropMethodType.CustomList}
        subTitle='You already have a list of recipients, skip the snapshot.'
        onClick={() => setData(() => ({ airdropMethod: AirdropMethodType.CustomList }))}
        checkboxProps={{
          withCheckbox: true,
          isChecked: data['airdropMethod'] === AirdropMethodType.CustomList,
          onCheckboxChange: (bool) => setData(() => ({ airdropMethod: bool ? AirdropMethodType.CustomList : AirdropMethodType.EMPTY })),
        }}
        visualProps={{
          bgColor: data['airdropMethod'] === AirdropMethodType.CustomList ? theme.colors.majestic_blue + Theme.opacity.hex['030'] : undefined,
          bgColorHover: data['airdropMethod'] === AirdropMethodType.CustomList ? theme.colors.majestic_blue + Theme.opacity.hex['040'] : undefined,
        }}
        renderActions={data['airdropMethod'] === AirdropMethodType.CustomList ? Selected : undefined}
      />
    </>
  )
})

AirdropMethod.displayName = AirdropMethod.name
