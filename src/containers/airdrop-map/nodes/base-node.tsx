import React, { memo } from 'react'
import styled from 'styled-components'
import { DataTab, Tooltip } from '@odigos/ui-kit/components'
import type { Node, NodeProps, XYPosition } from '@xyflow/react'
import { NOTIFICATION_TYPE, type SVG } from '@odigos/ui-kit/types'
import { NODE_TYPES, type StakeKey, type TransactionId } from '@/@types'
import { ErrorTriangleIcon, WarningTriangleIcon } from '@odigos/ui-kit/icons'
import nodeConfig from '../helpers/node-config'
import { DATA_START_TIME } from '@/constants'

export type BaseNodeProps = NodeProps<
  Node<
    {
      status?: NOTIFICATION_TYPE
      faded?: boolean
      title: string
      subTitle: string
      icons?: SVG[]
      iconSrcs?: string[]
      withClick?: boolean
      position: XYPosition
      airdropId: string
      txHash?: TransactionId
      stakeKey?: StakeKey
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
            <Tooltip text='Failed to collect data for historical airdrop'>
              <ErrorTriangleIcon size={20} />
            </Tooltip>
          ) : status === NOTIFICATION_TYPE.WARNING ? (
            <Tooltip
              text={`Historical airdrops (prior to ${new Date(DATA_START_TIME).toLocaleDateString('en-US')}) may have innacurate data displayed`}
            >
              <WarningTriangleIcon size={20} />
            </Tooltip>
          ) : null
        }
      />
    </Container>
  )
})

BaseNode.displayName = 'BaseNode'
export default BaseNode
