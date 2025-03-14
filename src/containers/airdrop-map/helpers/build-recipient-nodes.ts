import type { Node } from '@xyflow/react'
import { DATA_START_TIME } from '@/constants'
import { mapToNodeData } from './map-to-node-data'
import { resolveEdgedNode } from './resolve-edged-node'
import { NOTIFICATION_TYPE } from '@odigos/ui-kit/types'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
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
      .map(({ airdropId, thumb, txHash, tokenAmount, tokenName, stakeKey, timestamp }, idx) =>
        mapToNodeData({
          type: NODE_COLUMN_TYPES.RECIPIENTS,
          timestamp,
          airdropId,
          txHash,
          stakeKey,
          status: timestamp < DATA_START_TIME ? NOTIFICATION_TYPE.WARNING : undefined,
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
    items.forEach((data, idx) => nodes.push(resolveEdgedNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, dataFlowHeight))
  }

  return nodes
}
