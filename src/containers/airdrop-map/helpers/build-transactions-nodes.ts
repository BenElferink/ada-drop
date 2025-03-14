import type { Node } from '@xyflow/react'
import { mapToNodeData } from './map-to-node-data'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
import { resolveHiddenNode } from './resolve-edged-node'
import { resolveSkeletonNode } from './resolve-skeleton-node'
import { getNodePositions, isInPosition } from './get-node-positions'
import { type AirdropTransaction, NODE_COLUMN_TYPES, type OnScroll } from '@/@types'
import { formatIpfsReference, getTokenName, prettyNumber, truncateStringInMiddle } from '@/functions'

interface Params {
  dataFlowHeight: number
  dataFlowWidth: number
  transactions: AirdropTransaction[]
  onScroll: OnScroll
}

export const buildTransactionNodes = ({ dataFlowHeight, dataFlowWidth, transactions, onScroll }: Params) => {
  const positions = getNodePositions({ dataFlowWidth })
  const nodes: Node[] = []

  // Init Columns

  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, transactions.length))

  // Init Airdrops

  if (!!transactions.length) {
    const items = transactions
      .map(({ airdropId, thumb, tokenAmount, tokenName, txHash, recipientCount }, idx) =>
        mapToNodeData({
          type: NODE_COLUMN_TYPES.TRANSACTIONS,
          airdropId,
          iconSrc: formatIpfsReference(thumb).url,
          title: `${recipientCount} Recipients, ${prettyNumber(tokenAmount.display)} ${getTokenName(tokenName)}`,
          subTitle: truncateStringInMiddle(txHash, 15),
          withClick: false,
          positions,
          idx,
        })
      )
      .filter(({ position }) => isInPosition(position, dataFlowHeight, true))

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveHiddenNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, dataFlowHeight))
  }

  return nodes
}
