import React, { memo } from 'react'
import styled from 'styled-components'
import { NODE_TYPES } from '@/@types'
import Theme from '@odigos/ui-kit/theme'
import type { Node, NodeProps } from '@xyflow/react'
import { getStatusIcon } from '@odigos/ui-kit/functions'
import type { NOTIFICATION_TYPE, SVG } from '@odigos/ui-kit/types'
import { FlexRow, IconTitleBadge } from '@odigos/ui-kit/components'
import nodeConfig from '../helpers/node-config'

export type HeaderNodeProps = NodeProps<
  Node<
    {
      icon: SVG
      title: string
      badge: string | number
      isFetching?: boolean
      status?: NOTIFICATION_TYPE
    },
    NODE_TYPES.HEADER
  >
>

const Container = styled(FlexRow)`
  position: relative;
  width: ${nodeConfig.nodeWidth - nodeConfig.nodePadding * 2}px;
  padding: ${nodeConfig.nodePadding}px ${nodeConfig.nodePadding}px ${nodeConfig.nodePadding + 4}px;
  gap: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  justify-content: space-between;
`

const HeaderNode: React.FC<HeaderNodeProps> = memo(({ data }) => {
  const theme = Theme.useTheme()
  const { icon, title, badge, isFetching, status } = data
  const StatusIcon = status && getStatusIcon(status, theme)

  return (
    <Container className='nowheel nodrag'>
      <IconTitleBadge icon={icon} title={title} badge={badge} loading={isFetching} />
      {StatusIcon && <StatusIcon />}
    </Container>
  )
})

HeaderNode.displayName = 'HeaderNode'
export default HeaderNode
