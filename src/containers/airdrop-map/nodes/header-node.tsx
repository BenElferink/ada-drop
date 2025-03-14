import React, { memo } from 'react'
import styled from 'styled-components'
import { NODE_TYPES } from '@/@types'
import type { SVG } from '@odigos/ui-kit/types'
import type { Node, NodeProps } from '@xyflow/react'
import { IconTitleBadge } from '@odigos/ui-kit/components'
import nodeConfig from '../helpers/node-config'

export type HeaderNodeProps = NodeProps<
  Node<
    {
      icon: SVG
      title: string
      badge: string | number
      isFetching?: boolean
    },
    NODE_TYPES.HEADER
  >
>

const Container = styled.div`
  position: relative;
  width: ${nodeConfig.nodeWidth}px;
  padding: ${nodeConfig.nodePadding}px 0px ${nodeConfig.nodePadding + 4}px 0px;
  gap: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const HeaderNode: React.FC<HeaderNodeProps> = memo(({ data }) => {
  const { icon, title, badge, isFetching } = data

  return (
    <Container className='nowheel nodrag'>
      <IconTitleBadge icon={icon} title={title} badge={badge} loading={isFetching} />
    </Container>
  )
})

HeaderNode.displayName = 'HeaderNode'
export default HeaderNode
