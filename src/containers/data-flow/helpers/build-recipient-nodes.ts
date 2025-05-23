import type { Node } from '@xyflow/react'
import { mapToNodeData } from './map-to-node-data'
import { resolveEdgedNode } from './resolve-edged-node'
import { getTokenName, prettyNumber } from '@/functions'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
import { resolveSkeletonNode } from './resolve-skeleton-node'
import { getNodePositions, isInPosition } from './get-node-positions'
import { type AirdropRicipent, NODE_COLUMN_TYPES, type OnScroll, type OnScrollParams } from '@/@types'

interface Params {
  dataFlowHeight: number
  dataFlowWidth: number
  recipients: AirdropRicipent[]
  selectedAirdropId: string
  onScroll: OnScroll
  scrollParams?: OnScrollParams
}

export const buildRecipientNodes = ({ dataFlowHeight, dataFlowWidth, recipients, selectedAirdropId, onScroll, scrollParams }: Params) => {
  const positions = getNodePositions({ dataFlowWidth })
  const nodes: Node[] = []

  // Init Columns

  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, recipients.length))

  // Init Airdrops

  if (!!recipients.length) {
    const items = (!!selectedAirdropId ? recipients.filter(({ airdropId }) => airdropId === selectedAirdropId) : recipients)
      .map(({ airdropId, thumb, txHash, tokenAmount, tokenName, stakeKey, timestamp }, idx) =>
        mapToNodeData({
          type: NODE_COLUMN_TYPES.RECIPIENTS,
          timestamp,
          airdropId,
          txHash,
          stakeKey,
          // status: timestamp < DATA_START_TIME ? StatusType.Warning : undefined,
          iconSrc: thumb,
          title: `${prettyNumber(tokenAmount.display)} ${getTokenName(tokenName)}`,
          subTitle: stakeKey,
          withClick: true,
          positions,
          idx,
        })
      )
      .filter(({ position }) => isInPosition(position, dataFlowHeight, true, scrollParams))

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveEdgedNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, dataFlowHeight))
  }

  return nodes
}
