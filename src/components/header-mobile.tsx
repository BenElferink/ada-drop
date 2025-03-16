import React from 'react'
import { TITLE } from '@/constants'
import { CardanoLogo } from '@/icons'
import { ToggleDarkMode } from '@odigos/ui-kit/containers'
import { Header as Container, Text } from '@odigos/ui-kit/components'

export const HeaderMobile = () => {
  return (
    <Container
      left={[
        <CardanoLogo key='logo' size={50} />,
        <Text key='title' family='secondary' size={20}>
          {TITLE}
        </Text>,
      ]}
      right={[<ToggleDarkMode key='toggle-theme' />]}
    />
  )
}
