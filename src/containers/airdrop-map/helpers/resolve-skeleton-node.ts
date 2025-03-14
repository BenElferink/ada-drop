import { NODE_COLUMN_TYPES, NODE_TYPES } from '@/@types'
import type { NodePositions } from './get-node-positions'
import type { ScrollNodeProps } from '../nodes/scroll-node'

export const resolveSkeletonNode = (positions: NodePositions, type: NODE_COLUMN_TYPES, dataFlowHeight: number) => {
  return {
    id: `${type}$${NODE_TYPES.SKELETON}`,
    type: NODE_TYPES.SKELETON,
    position: {
      x: positions[type]['x'],
      y: positions[type]['y'](),
    },
    data: {
      dataFlowHeight,
    } as ScrollNodeProps['data'],
  }
}
