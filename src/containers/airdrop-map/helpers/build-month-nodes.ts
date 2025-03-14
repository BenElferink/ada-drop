import type { Node } from '@xyflow/react'
import { mapToNodeData } from './map-to-node-data'
import { getNodePositions } from './get-node-positions'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
import { resolveHiddenNode } from './resolve-edged-node'
import { resolveSkeletonNode } from './resolve-skeleton-node'
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
    const items = months.map(({ label, airdropCount }) =>
      mapToNodeData({
        airdropId: '',
        iconSrc: '/cardano.svg',
        title: label,
        subTitle: `${airdropCount} airdrops`,
        withClick: false,
      })
    )

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.ACTIVE_MONTHS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveHiddenNode(positions, NODE_COLUMN_TYPES.ACTIVE_MONTHS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.ACTIVE_MONTHS, dataFlowHeight))
  }

  return nodes
}
