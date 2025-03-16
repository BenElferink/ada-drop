import type { Node } from '@xyflow/react'
import { formatIpfsReference, truncateStringInMiddle } from '@/functions'
import { mapToNodeData } from '@/containers/data-flow/helpers/map-to-node-data'
import { resolveEdgedNode } from '@/containers/data-flow/helpers/resolve-edged-node'
import { resolveHeaderNode } from '@/containers/data-flow/helpers/resolve-header-node'
import { resolveScrollNode } from '@/containers/data-flow/helpers/resolve-scroll-node'
import { resolveSkeletonNode } from '@/containers/data-flow/helpers/resolve-skeleton-node'
import { getNodePositions, isInPosition } from '@/containers/data-flow/helpers/get-node-positions'
import { type AirdropTransaction, NODE_COLUMN_TYPES, type OnScroll, type OnScrollParams } from '@/@types'

interface Params {
  dataFlowHeight: number
  dataFlowWidth: number
  transactions: AirdropTransaction[]
  selectedAirdropId: string
  onScroll: OnScroll
  scrollParams?: OnScrollParams
}

export const buildTransactionNodes = ({ dataFlowHeight, dataFlowWidth, transactions, selectedAirdropId, onScroll, scrollParams }: Params) => {
  const positions = getNodePositions({ dataFlowWidth })
  const nodes: Node[] = []

  // Init Columns

  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, transactions.length))

  // Init Airdrops

  if (!!transactions.length) {
    const items = (!!selectedAirdropId ? transactions.filter(({ airdropId }) => airdropId === selectedAirdropId) : transactions)
      .map(({ airdropId, thumb, txHash, recipientCount, timestamp }, idx) =>
        mapToNodeData({
          type: NODE_COLUMN_TYPES.TRANSACTIONS,
          timestamp,
          airdropId,
          txHash,
          // status: timestamp < DATA_START_TIME ? NOTIFICATION_TYPE.WARNING : undefined,
          iconSrc: formatIpfsReference(thumb).url,
          // title: `${recipientCount} Recipients, ${prettyNumber(tokenAmount.display)} ${getTokenName(tokenName)}`,
          title: `${recipientCount} Recipients`,
          subTitle: truncateStringInMiddle(txHash, 15),
          withClick: true,
          positions,
          idx,
        })
      )
      .filter(({ position }) => isInPosition(position, dataFlowHeight, true, scrollParams))

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveEdgedNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, dataFlowHeight))
  }

  return nodes
}
