import type { Node } from '@xyflow/react'
import { mapToNodeData } from './map-to-node-data'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
import { resolveHiddenNode } from './resolve-edged-node'
import { resolveSkeletonNode } from './resolve-skeleton-node'
import { getNodePositions, isInPosition } from './get-node-positions'
import { type AirdropRicipent, NODE_COLUMN_TYPES, type OnScroll } from '@/@types'
import { formatIpfsReference, getTokenName, prettyNumber, truncateStringInMiddle } from '@/functions'

interface Params {
  dataFlowHeight: number
  dataFlowWidth: number
  recipients: AirdropRicipent[]
  onScroll: OnScroll
}

export const buildRecipientNodes = ({ dataFlowHeight, dataFlowWidth, recipients, onScroll }: Params) => {
  const positions = getNodePositions({ dataFlowWidth })
  const nodes: Node[] = []

  // Init Columns

  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, recipients.length))

  // Init Airdrops

  if (!!recipients.length) {
    const items = recipients
      .map(({ airdropId, thumb, tokenAmount, tokenName, stakeKey }, idx) =>
        mapToNodeData({
          type: NODE_COLUMN_TYPES.RECIPIENTS,
          airdropId,
          iconSrc: formatIpfsReference(thumb).url,
          title: `${prettyNumber(tokenAmount.display)} ${getTokenName(tokenName)}`,
          subTitle: truncateStringInMiddle(stakeKey, 15),
          withClick: true,
          positions,
          idx,
        })
      )
      .filter(({ position }) => isInPosition(position, dataFlowHeight, true))

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveHiddenNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, dataFlowHeight))
  }

  return nodes
}
