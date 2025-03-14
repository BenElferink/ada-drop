'use client'

import styled from 'styled-components'
import { Header } from '@/components'
import { AirdropMap } from '@/containers'
import { FlexColumn } from '@odigos/ui-kit/components'

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
      <AirdropMap />
    </PageContainer>
  )
}

export default Page
