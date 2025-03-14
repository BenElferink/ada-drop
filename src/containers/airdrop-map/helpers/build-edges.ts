import { EDGE_TYPES, NODE_COLUMN_TYPES, NODE_TYPES } from '@/@types'
import nodeConfig from './node-config'
import { EdgedNodeProps } from '../nodes/edged-node'
import type { DefaultTheme } from 'styled-components'
import type { Edge, Node, XYPosition } from '@xyflow/react'

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
    style: { stroke: isError ? theme?.colors.dark_red : theme?.colors.border },
  }
}

const isInPosition = (position: XYPosition, dataFlowHeight: number) => {
  const { nodeHeight, nodePadding } = nodeConfig
  const topLimit = -nodeHeight / 2 + nodePadding
  const bottomLimit = Math.floor(dataFlowHeight / nodeHeight) * nodeHeight - (nodeHeight / 2 + nodePadding)

  return position.y >= topLimit && position.y <= bottomLimit
}

export const buildEdges = ({ dataFlowHeight, nodes, theme }: Params) => {
  const edges: Edge[] = []

  // const actionNodeId = nodes.find(({ id: nodeId }) =>
  //   [`${ENTITY_TYPES.ACTION}-${NODE_TYPES.FRAME}`, `${ENTITY_TYPES.ACTION}-${NODE_TYPES.ADD}`].includes(nodeId)
  // )?.id

  nodes.forEach(({ type: nodeType, id: nodeId, position, data }) => {
    const columnType = nodeId.split('$')[0] as NODE_COLUMN_TYPES

    if (columnType === NODE_COLUMN_TYPES.AIRDROPS && nodeType === NODE_TYPES.EDGED && isInPosition(position, dataFlowHeight)) {
      const {} = data as EdgedNodeProps['data']
      // const transactionNodeIds = nodes.filter(({ id: nodeId }) => nodeId.includes(`${NODE_COLUMN_TYPES.TRANSACTIONS}$${NODE_TYPES.EDGED}`))

      edges.push(
        createEdge(`${nodeId}-to-${'TODO:TX_ID_HERE'}`, {
          theme,
          animated: false,
          isMultiTarget: true,
          label: '',
        })
      )
    }
  })

  return edges
}
