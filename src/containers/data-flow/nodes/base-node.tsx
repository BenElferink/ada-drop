import React, { memo } from 'react'
import styled from 'styled-components'
import { KnownWallet } from '@/components'
import { HISTORIC_DATA_MESSAGES } from '@/constants'
import { WarningTriangleIcon } from '@odigos/ui-kit/icons'
import { DataTab, Tooltip } from '@odigos/ui-kit/components'
import type { Node, NodeProps, XYPosition } from '@xyflow/react'
import { NOTIFICATION_TYPE, type SVG } from '@odigos/ui-kit/types'
import { NODE_COLUMN_TYPES, NODE_TYPES, type StakeKey, type TransactionId } from '@/@types'
import nodeConfig from '../helpers/node-config'

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
      airdropId?: string
      txHash?: TransactionId
      timestamp: number
      stakeKey?: StakeKey
    },
    NODE_TYPES.BASE
  >
>

const Container = styled.div`
  width: ${nodeConfig.nodeWidth}px;
  height: ${nodeConfig.nodeHeight}px;
`

const BaseNode: React.FC<BaseNodeProps> = memo(({ id, data }) => {
  const nodeColumnType = id.split('$')[0] as NODE_COLUMN_TYPES
  const { status, faded, title, subTitle, icons, iconSrcs, withClick, stakeKey } = data

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
          status === NOTIFICATION_TYPE.WARNING ? (
            <Tooltip titleIcon={WarningTriangleIcon} title={HISTORIC_DATA_MESSAGES.TITLE} text={HISTORIC_DATA_MESSAGES.DESCRIPTION}>
              <WarningTriangleIcon size={20} />
            </Tooltip>
          ) : nodeColumnType === NODE_COLUMN_TYPES.AIRDROPS ? (
            <KnownWallet wallet={stakeKey} />
          ) : null
        }
      />
    </Container>
  )
})

BaseNode.displayName = 'BaseNode'
export default BaseNode
