import type { Node } from '@xyflow/react'
import { StatusType } from '@odigos/ui-kit/types'
import { mapToNodeData } from './map-to-node-data'
import { resolveEdgedNode } from './resolve-edged-node'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
import { resolveSkeletonNode } from './resolve-skeleton-node'
import { getNodePositions, isInPosition } from './get-node-positions'
import { getTimestampLabel, getTokenName, prettyNumber } from '@/functions'
import { type Airdrop, NODE_COLUMN_TYPES, type OnScroll, type OnScrollParams } from '@/@types'

interface Params {
  isMobile?: boolean
  dataFlowHeight: number
  dataFlowWidth: number
  airdrops: Airdrop[]
  selectedAirdropId: string
  onScroll: OnScroll
  scrollParams?: OnScrollParams
}

export const buildAirdropNodes = ({ isMobile, dataFlowHeight, dataFlowWidth, airdrops, selectedAirdropId, onScroll, scrollParams }: Params) => {
  const positions = getNodePositions({ isMobile, dataFlowWidth })
  const nodes: Node[] = []

  // Init Columns

  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.AIRDROPS, airdrops.length))

  // Init Airdrops

  if (!!airdrops.length) {
    const items = (!!selectedAirdropId ? airdrops.filter(({ id }) => id === selectedAirdropId) : airdrops)
      .map(({ id, thumb, tokenAmount, tokenName, stakeKey, recipients, timestamp }, idx) =>
        mapToNodeData({
          type: NODE_COLUMN_TYPES.AIRDROPS,
          timestamp,
          airdropId: id,
          stakeKey,
          status: !recipients?.length ? StatusType.Warning : undefined,
          iconSrc: thumb,
          title: `${prettyNumber(tokenAmount.display)} ${getTokenName(tokenName)}`,
          subTitle: isMobile ? `${recipients?.length || 0} Recipients • ${getTimestampLabel(timestamp).label}` : stakeKey,
          withClick: !isMobile,
          positions,
          idx,
        })
      )
      .filter(({ position }) => isInPosition(position, dataFlowHeight, true, scrollParams))

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.AIRDROPS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveEdgedNode(positions, NODE_COLUMN_TYPES.AIRDROPS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.AIRDROPS, dataFlowHeight))
  }

  return nodes
}
