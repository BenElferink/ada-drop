import type { Node } from '@xyflow/react'
import { mapToNodeData } from './map-to-node-data'
import { resolveEdgedNode } from './resolve-edged-node'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
import { resolveSkeletonNode } from './resolve-skeleton-node'
import { getNodePositions, isInPosition } from './get-node-positions'
import { type AirdropMonth, NODE_COLUMN_TYPES, type OnScroll } from '@/@types'

interface Params {
  dataFlowHeight: number
  dataFlowWidth: number
  months: AirdropMonth[]
  onScroll: OnScroll
}

export const buildMonthNodes = ({ dataFlowHeight, dataFlowWidth, months, onScroll }: Params) => {
  const positions = getNodePositions({ dataFlowWidth })
  const nodes: Node[] = []

  // Init Columns

  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.ACTIVE_MONTHS, months.length))

  // Init Airdrops

  if (!!months.length) {
    const items = months
      .map(({ label, airdropCount, timestamp }, idx) =>
        mapToNodeData({
          type: NODE_COLUMN_TYPES.ACTIVE_MONTHS,
          timestamp,
          iconSrc: '/cardano.svg',
          title: label,
          subTitle: `Airdrops: ${airdropCount}`,
          withClick: false,
          positions,
          idx,
        })
      )
      .filter(({ position }) => isInPosition(position, dataFlowHeight, true))

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.ACTIVE_MONTHS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveEdgedNode(positions, NODE_COLUMN_TYPES.ACTIVE_MONTHS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.ACTIVE_MONTHS, dataFlowHeight))
  }

  return nodes
}
