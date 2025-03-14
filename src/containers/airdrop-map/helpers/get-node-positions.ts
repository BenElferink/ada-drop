import nodeConfig from './node-config'
import { NODE_COLUMN_TYPES } from '@/@types'
import type { XYPosition } from '@xyflow/react'

const { nodeWidth, nodeHeight, nodePadding } = nodeConfig

interface Params {
  dataFlowWidth: number
}

export type NodePositions = Record<
  NODE_COLUMN_TYPES,
  {
    x: number
    y: (idx?: number) => number
  }
>

export const getNodePositions = ({ dataFlowWidth }: Params) => {
  const startX = 24
  const endX = (dataFlowWidth <= 1500 ? 1500 : dataFlowWidth) - nodeWidth - startX
  const getY = (idx?: number) => nodeHeight * ((idx || 0) + 1)

  const positions: NodePositions = {
    [NODE_COLUMN_TYPES.ACTIVE_MONTHS]: {
      x: startX,
      y: getY,
    },
    [NODE_COLUMN_TYPES.AIRDROPS]: {
      x: (endX - startX) * 0.33,
      y: getY,
    },
    [NODE_COLUMN_TYPES.TRANSACTIONS]: {
      x: (endX - startX) * 0.66,
      y: getY,
    },
    [NODE_COLUMN_TYPES.RECIPIENTS]: {
      x: endX,
      y: getY,
    },
  }

  return positions
}

export const isInPosition = (position: XYPosition, dataFlowHeight: number, withScroll?: boolean) => {
  const topLimit = -nodeHeight / 2 + nodePadding
  let bottomLimit = Math.floor(dataFlowHeight / nodeHeight) * nodeHeight - (nodeHeight / 2 + nodePadding)

  if (withScroll) bottomLimit += 555

  return position.y >= topLimit && position.y <= bottomLimit
}
