'use client'

import styled from 'styled-components'
import { useMobile } from '@/hooks'
import { AirdropMap } from '@/containers'
import { Header, HeaderMobile } from '@/components'
import { ToastList } from '@odigos/ui-kit/containers'
import { FlexColumn } from '@odigos/ui-kit/components'
import { AirdropMapMobile } from '@/containers/airdrop-map-mobile'

const PageContainer = styled(FlexColumn)`
  width: 100%;
  min-height: 100vh;
  background-color: ${({ theme }) => (theme as any).colors.primary};
  align-items: center;
`

const Page = () => {
  const { isMobile } = useMobile()

  if (isMobile) {
    return (
      <PageContainer>
        <HeaderMobile />
        <AirdropMapMobile heightToRemove='88px' />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Header />
      <AirdropMap heightToRemove='88px' />
      <ToastList />
    </PageContainer>
  )
}

export default Page
