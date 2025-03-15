import type { Node } from '@xyflow/react'
import { mapToNodeData } from './map-to-node-data'
import { resolveEdgedNode } from './resolve-edged-node'
import { NOTIFICATION_TYPE } from '@odigos/ui-kit/types'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
import { resolveSkeletonNode } from './resolve-skeleton-node'
import { getNodePositions, isInPosition } from './get-node-positions'
import { type Airdrop, NODE_COLUMN_TYPES, type OnScroll } from '@/@types'
import { formatIpfsReference, getTokenName, prettyNumber, truncateStringInMiddle } from '@/functions'
import { DATA_START_TIME } from '@/constants'

interface Params {
  dataFlowHeight: number
  dataFlowWidth: number
  airdrops: Airdrop[]
  onScroll: OnScroll
}

export const buildAirdropNodes = ({ dataFlowHeight, dataFlowWidth, airdrops, onScroll }: Params) => {
  const positions = getNodePositions({ dataFlowWidth })
  const nodes: Node[] = []

  // Init Columns

  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.AIRDROPS, airdrops.length))

  // Init Airdrops

  if (!!airdrops.length) {
    const items = airdrops
      .map(({ id, thumb, tokenAmount, tokenName, stakeKey, recipients, timestamp }, idx) =>
        mapToNodeData({
          type: NODE_COLUMN_TYPES.AIRDROPS,
          timestamp,
          airdropId: id,
          stakeKey,
          status: !recipients?.length ? NOTIFICATION_TYPE.ERROR : timestamp < DATA_START_TIME ? NOTIFICATION_TYPE.WARNING : undefined,
          iconSrc: formatIpfsReference(thumb).url,
          title: `${prettyNumber(tokenAmount.display)} ${getTokenName(tokenName)}`,
          subTitle: truncateStringInMiddle(stakeKey, 15),
          withClick: true,
          positions,
          idx,
        })
      )
      .filter(({ position }) => isInPosition(position, dataFlowHeight, true))

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.AIRDROPS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveEdgedNode(positions, NODE_COLUMN_TYPES.AIRDROPS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.AIRDROPS, dataFlowHeight))
  }

  return nodes
}
