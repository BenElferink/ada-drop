import type { Node } from '@xyflow/react'
import type { BaseNodeProps } from '../nodes/base-node'
import type { NodePositions } from './get-node-positions'
import { NODE_COLUMN_TYPES, NODE_TYPES } from '@/@types'
import nodeConfig from './node-config'

export const resolveEdgedNode = (positions: NodePositions, type: NODE_COLUMN_TYPES, idx: number, data: BaseNodeProps['data']) => {
  return {
    id: `${type}$${NODE_TYPES.EDGED}-${data.airdropId}-${data.txHash}-${data.stakeKey}`,
    type: NODE_TYPES.EDGED,
    extent: 'parent' as Node['extent'],
    parentId: `${type}$${NODE_TYPES.SCROLL}`,
    position: {
      x: nodeConfig.nodePadding,
      y: positions[type]['y'](idx) - (nodeConfig.nodeHeight + nodeConfig.nodePadding / 2),
    },
    style: {
      zIndex: -1,
    },
    data,
  }
}
