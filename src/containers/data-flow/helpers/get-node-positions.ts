import nodeConfig from './node-config'
import type { XYPosition } from '@xyflow/react'
import { NODE_COLUMN_TYPES, type OnScrollParams } from '@/@types'

const { nodeWidth, nodeHeight, nodePadding } = nodeConfig

interface Params {
  isMobile?: boolean
  dataFlowWidth: number
}

export type NodePositions = Record<
  NODE_COLUMN_TYPES,
  {
    x: number
    y: (idx?: number) => number
  }
>

export const getNodePositions = ({ isMobile, dataFlowWidth }: Params) => {
  if (isMobile) {
    const startX = dataFlowWidth < nodeWidth ? 0 : dataFlowWidth / 2 - nodeWidth / 2
    const getY = (idx?: number) => nodeHeight * ((idx || 0) + 1)

    const positions: NodePositions = {
      [NODE_COLUMN_TYPES.ACTIVE_MONTHS]: {
        x: 0,
        y: () => 0,
      },
      [NODE_COLUMN_TYPES.AIRDROPS]: {
        x: startX,
        y: getY,
      },
      [NODE_COLUMN_TYPES.TRANSACTIONS]: {
        x: 0,
        y: () => 0,
      },
      [NODE_COLUMN_TYPES.RECIPIENTS]: {
        x: 0,
        y: () => 0,
      },
    }

    return positions
  }

  const startX = 24
  const endX = (dataFlowWidth < 1300 ? 1300 : dataFlowWidth) - nodeWidth - startX
  const getY = (idx?: number) => nodeHeight * ((idx || 0) + 1)

  const positions: NodePositions = {
    [NODE_COLUMN_TYPES.ACTIVE_MONTHS]: {
      x: startX,
      y: getY,
    },
    [NODE_COLUMN_TYPES.AIRDROPS]: {
      x: (endX - startX) * 0.36,
      y: getY,
    },
    [NODE_COLUMN_TYPES.TRANSACTIONS]: {
      x: (endX - startX) * 0.69,
      y: getY,
    },
    [NODE_COLUMN_TYPES.RECIPIENTS]: {
      x: endX,
      y: getY,
    },
  }

  return positions
}

export const isInPosition = (position: XYPosition, dataFlowHeight: number, withScroll?: boolean, scrollParams?: OnScrollParams) => {
  const topLimit = -nodeHeight / 2 + nodePadding
  let bottomLimit = Math.floor(dataFlowHeight / nodeHeight) * nodeHeight - (nodeHeight / 2 + nodePadding)

  // init with more space to allow scrolling (not for edges)
  if (withScroll) bottomLimit += scrollParams?.clientHeight || 1000

  // add more nodes to the bottom limit if the scroll is at the bottom
  if (withScroll && !!scrollParams && bottomLimit + scrollParams.scrollTop >= scrollParams.scrollHeight) {
    bottomLimit += scrollParams.scrollHeight
  }

  return position.y >= topLimit && position.y <= bottomLimit
}
