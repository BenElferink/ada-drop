'use client'

import styled from 'styled-components'
import Header from '@/components/header'
import { FlexColumn } from '@odigos/ui-components'

const PageContainer = styled(FlexColumn)`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
`

const Page = () => {
  return (
    <PageContainer>
      <Header />
    </PageContainer>
  )
}

export default Page
