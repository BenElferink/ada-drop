import React from 'react'
import { TITLE } from '@/constants'
import { CardanoLogo } from '@/icons'
import styled from 'styled-components'
import { ToggleDarkMode } from '@odigos/ui-kit/containers'
import { Header as Container, Text } from '@odigos/ui-kit/components'

const OverrideStyles = styled.div`
  width: 100%;
  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    & > div {
      margin: 0;
    }
  }
`

export const HeaderMobile = () => {
  return (
    <OverrideStyles>
      <Container
        left={[
          <CardanoLogo key='logo' size={50} />,
          <Text key='title' family='secondary' size={20}>
            {TITLE}
          </Text>,
        ]}
        right={[<ToggleDarkMode key='toggle-theme' />]}
      />
    </OverrideStyles>
  )
}
