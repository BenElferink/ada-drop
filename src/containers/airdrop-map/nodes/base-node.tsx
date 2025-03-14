import React, { memo } from 'react'
import styled from 'styled-components'
import { NODE_TYPES } from '@/@types'
import { DataTab } from '@odigos/ui-kit/components'
import { NOTIFICATION_TYPE, type SVG } from '@odigos/ui-kit/types'
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react'
import { ErrorTriangleIcon, WarningTriangleIcon } from '@odigos/ui-kit/icons'
import nodeConfig from '../helpers/node-config'

export type BaseNodeProps = NodeProps<
  Node<
    {
      airdropId: string
      status?: NOTIFICATION_TYPE
      faded?: boolean
      title: string
      subTitle: string
      icons?: SVG[]
      iconSrcs?: string[]
      withClick?: boolean
    },
    NODE_TYPES.BASE
  >
>

const Container = styled.div`
  width: ${nodeConfig.nodeWidth}px;
  height: ${nodeConfig.nodeHeight}px;
`

const BaseNode: React.FC<BaseNodeProps> = memo(({ data }) => {
  const { status, faded, title, subTitle, icons, iconSrcs, withClick } = data

  return (
    <Container className='nowheel nodrag'>
      <DataTab
        title={title}
        subTitle={subTitle}
        icons={icons}
        iconSrcs={iconSrcs}
        status={status}
        faded={faded}
        onClick={withClick ? () => {} : undefined}
        renderActions={() =>
          status === NOTIFICATION_TYPE.ERROR ? (
            <ErrorTriangleIcon size={20} />
          ) : status === NOTIFICATION_TYPE.WARNING ? (
            <WarningTriangleIcon size={20} />
          ) : null
        }
      />
      <Handle type='target' position={Position.Left} style={{ visibility: 'hidden' }} />
      <Handle type='source' position={Position.Right} style={{ visibility: 'hidden' }} />
    </Container>
  )
})

BaseNode.displayName = 'BaseNode'
export default BaseNode
