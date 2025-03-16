import type { Node } from '@xyflow/react'
import { NOTIFICATION_TYPE } from '@odigos/ui-kit/types'
import { mapToNodeData } from '@/containers/data-flow/helpers/map-to-node-data'
import { resolveEdgedNode } from '@/containers/data-flow/helpers/resolve-edged-node'
import { resolveHeaderNode } from '@/containers/data-flow/helpers/resolve-header-node'
import { resolveScrollNode } from '@/containers/data-flow/helpers/resolve-scroll-node'
import { resolveSkeletonNode } from '@/containers/data-flow/helpers/resolve-skeleton-node'
import { type Airdrop, NODE_COLUMN_TYPES, type OnScroll, type OnScrollParams } from '@/@types'
import { getNodePositions, isInPosition } from '@/containers/data-flow/helpers/get-node-positions'
import { formatIpfsReference, getTokenName, prettyNumber, truncateStringInMiddle } from '@/functions'

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
          status: !recipients?.length ? NOTIFICATION_TYPE.WARNING : undefined,
          iconSrc: formatIpfsReference(thumb).url,
          title: `${prettyNumber(tokenAmount.display)} ${getTokenName(tokenName)}`,
          subTitle: truncateStringInMiddle(stakeKey, 15),
          withClick: false,
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
