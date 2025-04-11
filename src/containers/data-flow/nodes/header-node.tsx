import React, { memo } from 'react'
import styled from 'styled-components'
import { NODE_TYPES } from '@/@types'
import { HISTORIC_DATA_MESSAGES } from '@/constants'
import type { Node, NodeProps } from '@xyflow/react'
import { WarningTriangleIcon } from '@odigos/ui-kit/icons'
import { StatusType, type SVG } from '@odigos/ui-kit/types'
import { FlexRow, IconTitleBadge, Tooltip } from '@odigos/ui-kit/components'
import nodeConfig from '../helpers/node-config'

export type HeaderNodeProps = NodeProps<
  Node<
    {
      icon: SVG
      title: string
      badge: string | number
      isFetching?: boolean
      status?: StatusType
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
  const { icon, title, badge, isFetching, status } = data

  return (
    <Container className='nowheel nodrag'>
      <IconTitleBadge icon={icon} title={title} badge={badge} loading={isFetching} />

      {status === StatusType.Warning ? (
        <Tooltip titleIcon={WarningTriangleIcon} title={HISTORIC_DATA_MESSAGES.TITLE} text={HISTORIC_DATA_MESSAGES.DESCRIPTION}>
          <WarningTriangleIcon size={20} />
        </Tooltip>
      ) : null}
    </Container>
  )
})

HeaderNode.displayName = 'HeaderNode'
export default HeaderNode
