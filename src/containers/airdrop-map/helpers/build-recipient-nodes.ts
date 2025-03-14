import type { Node } from '@xyflow/react'
import { mapToNodeData } from './map-to-node-data'
import { getNodePositions } from './get-node-positions'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
import { resolveHiddenNode } from './resolve-edged-node'
import { resolveSkeletonNode } from './resolve-skeleton-node'
import { NODE_COLUMN_TYPES, type OnScroll } from '@/@types'

interface Params {
  dataFlowHeight: number
  dataFlowWidth: number
  recipients: []
  onScroll: OnScroll
}

export const buildRecipientNodes = ({ dataFlowHeight, dataFlowWidth, recipients, onScroll }: Params) => {
  const positions = getNodePositions({ dataFlowWidth })
  const nodes: Node[] = []

  // Init Columns

  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, recipients.length))

  // Init Airdrops

  if (!!recipients.length) {
    const items = recipients.map(({}) =>
      mapToNodeData({
        airdropId: '',
        iconSrc: '/cardano.svg',
        title: '',
        subTitle: '',
        withClick: false,
      })
    )

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveHiddenNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, dataFlowHeight))
  }

  return nodes
}
