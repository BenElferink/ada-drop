import type { Node } from '@xyflow/react'
import { mapToNodeData } from './map-to-node-data'
import { getNodePositions } from './get-node-positions'
import { resolveHeaderNode } from './resolve-header-node'
import { resolveScrollNode } from './resolve-scroll-node'
import { resolveHiddenNode } from './resolve-edged-node'
import { resolveSkeletonNode } from './resolve-skeleton-node'
import { formatIpfsReference, truncateStringInMiddle } from '@/functions'
import { type Airdrop, NODE_COLUMN_TYPES, type OnScroll } from '@/@types'

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
    const items = airdrops.map(({ id, thumb, tokenAmount, tokenName, stakeKey }) =>
      mapToNodeData({
        airdropId: id,
        iconSrc: formatIpfsReference(thumb).url,
        title: `${tokenAmount.display.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })} ${tokenName.ticker || tokenName.display || tokenName.onChain}`,
        subTitle: truncateStringInMiddle(stakeKey, 15),
        withClick: true,
      })
    )

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.AIRDROPS, dataFlowHeight, items, onScroll))
    items.forEach((data, idx) => nodes.push(resolveHiddenNode(positions, NODE_COLUMN_TYPES.AIRDROPS, idx, data)))
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.AIRDROPS, dataFlowHeight))
  }

  return nodes
}
