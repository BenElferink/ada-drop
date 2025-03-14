import type { Node } from '@xyflow/react'
import nodeConfig from './node-config'
import { CardanoLogo } from '@/components'
import { BaseNodeProps } from '../nodes/base-node'
import { ServiceMapIcon } from '@odigos/ui-kit/icons'
import { HeaderNodeProps } from '../nodes/header-node'
import { ScrollNodeProps } from '../nodes/scroll-node'
import { Airdrop, NODE_COLUMN_TYPES, NODE_TYPES } from '@/@types'
import { getNodePositions, NodePositions } from './get-node-positions'
import { formatIpfsReference, truncateStringInMiddle } from '@/functions'

interface Params {
  dataFlowHeight: number
  dataFlowWidth: number
  airdrops: Airdrop[]
  onScroll: (params: { clientHeight: number; scrollHeight: number; scrollTop: number }) => void
}

const mapToNodeData = (iconSrc: string, title: string, subTitle: string) => {
  return {
    status: undefined,
    faded: undefined,
    title,
    subTitle,
    icons: !iconSrc ? [CardanoLogo] : undefined,
    iconSrcs: !!iconSrc ? [iconSrc] : undefined,
  } as BaseNodeProps['data']
}

const resolveHeaderNode = (positions: NodePositions, type: NODE_COLUMN_TYPES, badge: number) => {
  return {
    id: `${type} $${NODE_TYPES.HEADER}`,
    type: NODE_TYPES.HEADER,
    position: {
      x: positions[type]['x'],
      y: 0,
    },
    data: {
      icon: ServiceMapIcon,
      title: type,
      badge,
      isFetching: !badge,
    } as HeaderNodeProps['data'],
  }
}

const resolveSkeletonNode = (positions: NodePositions, type: NODE_COLUMN_TYPES, dataFlowHeight: number) => {
  return {
    id: `${type} $${NODE_TYPES.SKELETON}`,
    type: NODE_TYPES.SKELETON,
    position: {
      x: positions[type]['x'],
      y: positions[type]['y'](),
    },
    data: {
      dataFlowHeight,
    } as ScrollNodeProps['data'],
  }
}

const resolveScrollNode = (
  positions: NodePositions,
  type: NODE_COLUMN_TYPES,
  dataFlowHeight: number,
  items: BaseNodeProps['data'][],
  onScroll: Params['onScroll']
) => {
  return {
    id: `${type} $${NODE_TYPES.SCROLL}`,
    type: NODE_TYPES.SCROLL,
    position: {
      x: positions[type]['x'],
      y: positions[type]['y']() - nodeConfig.nodePadding,
    },
    style: {
      zIndex: 1,
    },
    data: {
      dataFlowHeight,
      items: items.map((data, idx) => ({
        id: `${type}-${idx}`,
        data,
      })),
      onScroll,
    },
  }
}

const resolveHiddenNode = (positions: NodePositions, type: NODE_COLUMN_TYPES, idx: number, data: BaseNodeProps['data']) => {
  return {
    id: `${type}-${idx}-hidden`,
    type: NODE_TYPES.EDGED,
    extent: 'parent' as Node['extent'],
    parentId: `${type} $${NODE_TYPES.SCROLL}`,
    position: {
      x: nodeConfig.nodePadding,
      y: positions[type]['y'](idx) - (nodeConfig.nodeHeight - nodeConfig.nodePadding / 2),
    },
    style: {
      zIndex: -1,
    },
    data,
  }
}

export const buildNodes = ({ dataFlowHeight, dataFlowWidth, airdrops, onScroll }: Params) => {
  const positions = getNodePositions({ dataFlowWidth })
  const nodes: Node[] = []

  const months = []
  const txs = []
  const recipients = []

  // Init Columns

  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.ACTIVE_MONTHS, months.length))
  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.AIRDROPS, airdrops.length))
  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, txs.length))
  nodes.push(resolveHeaderNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, recipients.length))

  // Init Months

  nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.ACTIVE_MONTHS, dataFlowHeight))

  // Init Airdrops

  if (!!airdrops.length) {
    const items = airdrops.map(({ thumb, tokenAmount, tokenName, stakeKey }) =>
      mapToNodeData(
        formatIpfsReference(thumb).url,
        `${tokenAmount.display.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })} ${tokenName.ticker || tokenName.display || tokenName.onChain}`,
        truncateStringInMiddle(stakeKey, 15)
      )
    )

    nodes.push(resolveScrollNode(positions, NODE_COLUMN_TYPES.AIRDROPS, dataFlowHeight, items, onScroll))

    airdrops.forEach((_, idx) => {
      const data = mapToNodeData('', '', '')
      nodes.push(resolveHiddenNode(positions, NODE_COLUMN_TYPES.AIRDROPS, idx, data))
    })
  } else {
    nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.AIRDROPS, dataFlowHeight))
  }

  // Init Transactions

  nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.TRANSACTIONS, dataFlowHeight))

  // Init Recipients

  nodes.push(resolveSkeletonNode(positions, NODE_COLUMN_TYPES.RECIPIENTS, dataFlowHeight))

  return nodes
}
