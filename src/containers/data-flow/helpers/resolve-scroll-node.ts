import type { BaseNodeProps } from '../nodes/base-node'
import type { NodePositions } from './get-node-positions'
import type { ScrollNodeProps } from '../nodes/scroll-node'
import { NODE_COLUMN_TYPES, NODE_TYPES, type OnScroll } from '@/@types'
import nodeConfig from './node-config'

export const resolveScrollNode = (
  positions: NodePositions,
  type: NODE_COLUMN_TYPES,
  dataFlowHeight: number,
  items: BaseNodeProps['data'][],
  onScroll: OnScroll
) => {
  return {
    id: `${type}$${NODE_TYPES.SCROLL}`,
    type: NODE_TYPES.SCROLL,
    position: {
      x: positions[type]['x'],
      y: positions[type]['y']() - nodeConfig.nodePadding,
    },
    style: {
      zIndex: 1,
    },
    data: {
      dataFlowHeight,
      items: items.map((data) => ({
        id: `${type}$${NODE_TYPES.SCROLL}-${NODE_TYPES.BASE}-${data.airdropId}-${data.txHash}-${data.stakeKey}-${data.timestamp}`,
        data,
      })),
      onScroll,
    } as ScrollNodeProps['data'],
  }
}
