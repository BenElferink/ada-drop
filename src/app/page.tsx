'use client'

import styled from 'styled-components'
import { useMobile } from '@/hooks'
import { AirdropMap } from '@/containers'
import { Header, HeaderMobile } from '@/components'
import { FlexColumn } from '@odigos/ui-kit/components'

const PageContainer = styled(FlexColumn)`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.primary};
  align-items: center;
`

const Page = () => {
  const { isMobile } = useMobile()

  if (isMobile) {
    return (
      <PageContainer>
        <HeaderMobile />
        <AirdropMap heightToRemove='88px' />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Header />
      <AirdropMap heightToRemove='88px' />
    </PageContainer>
  )
}

export default Page
