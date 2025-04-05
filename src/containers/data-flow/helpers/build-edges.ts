import { EDGE_TYPES, NODE_COLUMN_TYPES, NODE_TYPES } from '@/@types'
import type { Edge, Node } from '@xyflow/react'
import { getTimestampLabel } from '@/functions'
import { isInPosition } from './get-node-positions'
import type { DefaultTheme } from 'styled-components'
import type { EdgedNodeProps } from '../nodes/edged-node'

interface Params {
  dataFlowHeight: number
  nodes: Node[]
  theme: DefaultTheme
}

const createEdge = (
  edgeId: string,
  params?: { theme: Params['theme']; label?: string; isMultiTarget?: boolean; isError?: boolean; animated?: boolean }
): Edge => {
  const { theme, label, isMultiTarget, isError, animated } = params || {}
  const [sourceNodeId, targetNodeId] = edgeId.split('-to-')

  return {
    id: edgeId,
    type: !!label ? EDGE_TYPES.LABELED : 'default',
    source: sourceNodeId,
    target: targetNodeId,
    animated,
    data: { label, isMultiTarget, isError },
    style: { stroke: isError ? (theme as any)?.colors.dark_red : (theme as any)?.colors.border },
  }
}

export const buildEdges = ({ dataFlowHeight, nodes, theme }: Params) => {
  const edgeSet = new Set<string>() // Track unique edge IDs

  nodes.forEach(({ id: nodeId, type: nodeType, position, data }) => {
    const columnType = nodeId.split('$')[0] as NODE_COLUMN_TYPES
    const { airdropId, txHash, timestamp } = data as EdgedNodeProps['data']

    if (columnType === NODE_COLUMN_TYPES.ACTIVE_MONTHS && nodeType === NODE_TYPES.EDGED && isInPosition(position, dataFlowHeight)) {
      nodes
        .filter(
          (node) =>
            node.id.includes(`${NODE_COLUMN_TYPES.AIRDROPS}$${NODE_TYPES.EDGED}`) &&
            isInPosition(node.position, dataFlowHeight) &&
            getTimestampLabel(node.data.timestamp as number).startOfmonth === timestamp
        )
        .forEach(({ id }) => {
          const edgeId = `${nodeId}-to-${id}`
          if (!edgeSet.has(edgeId)) edgeSet.add(edgeId)
        })
    }

    if (columnType === NODE_COLUMN_TYPES.AIRDROPS && nodeType === NODE_TYPES.EDGED && isInPosition(position, dataFlowHeight)) {
      nodes
        .filter(
          (node) =>
            node.id.includes(`${NODE_COLUMN_TYPES.TRANSACTIONS}$${NODE_TYPES.EDGED}-${airdropId}`) && isInPosition(node.position, dataFlowHeight)
        )
        .forEach(({ id }) => {
          const edgeId = `${nodeId}-to-${id}`
          if (!edgeSet.has(edgeId)) edgeSet.add(edgeId)
        })
    }

    if (columnType === NODE_COLUMN_TYPES.TRANSACTIONS && nodeType === NODE_TYPES.EDGED && isInPosition(position, dataFlowHeight)) {
      nodes
        .filter(
          (node) =>
            node.id.includes(`${NODE_COLUMN_TYPES.RECIPIENTS}$${NODE_TYPES.EDGED}-${airdropId}-${txHash}`) &&
            isInPosition(node.position, dataFlowHeight)
        )
        .forEach(({ id }) => {
          const edgeId = `${nodeId}-to-${id}`
          if (!edgeSet.has(edgeId)) edgeSet.add(edgeId)
        })
    }
  })

  return Array.from(edgeSet).map((edgeId) =>
    createEdge(edgeId, {
      theme,
      animated: (edgeId.split('-to-')[0].split('$')[0] as NODE_COLUMN_TYPES) !== NODE_COLUMN_TYPES.ACTIVE_MONTHS,
    })
  )
}
