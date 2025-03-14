import React, { FC, useCallback, useEffect, type CSSProperties } from 'react'
import styled from 'styled-components'
import { DataFlow } from './data-flow'
import Theme from '@odigos/ui-kit/theme'
import { useContainerSize } from '@odigos/ui-kit/hooks'
import { NODE_COLUMN_TYPES, NODE_TYPES } from '@/@types'
import { useAirdrops, UseAirdropsExtended } from '@/hooks'
import { buildMonthNodes } from './helpers/build-month-nodes'
import { buildAirdropNodes } from './helpers/build-airdrop-nodes'
import { buildRecipientNodes } from './helpers/build-recipient-nodes'
import { buildTransactionNodes } from './helpers/build-transactions-nodes'
import { applyNodeChanges, type Edge, type Node, useEdgesState, useNodesState } from '@xyflow/react'
import { buildEdges } from './helpers/build-edges'

interface AirdropMapProps {
  heightToRemove: CSSProperties['height']
}

const Container = styled.div<{ $heightToRemove: AirdropMapProps['heightToRemove'] }>`
  width: 100%;
  height: ${({ $heightToRemove }) => `calc(100vh - ${$heightToRemove})`};
  position: relative;
`

export const AirdropMap: FC<AirdropMapProps> = ({ heightToRemove }) => {
  const theme = Theme.useTheme()
  const { airdrops } = useAirdrops()
  const { months, transactions, recipients } = UseAirdropsExtended()
  const { containerRef, containerHeight, containerWidth } = useContainerSize()

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])

  const handleNodesChanged = useCallback(
    (currNodes: Node[], key: NODE_COLUMN_TYPES) => {
      setNodes((prevNodes) => {
        const payload = [...prevNodes].filter(({ id }) => id.split('$')[0] !== key)
        return payload.concat(currNodes)
      })
    },
    [setNodes]
  )

  const handleNodesScrolled = useCallback(
    (currNodes: Node[], key: NODE_COLUMN_TYPES, yOffset: number) => {
      setNodes((prevNodes) =>
        applyNodeChanges(
          currNodes
            .filter((node) => node.extent === 'parent' && node.parentId?.includes(`${key}$${NODE_TYPES.SCROLL}`))
            .map((node) => ({
              id: node.id,
              type: 'position',
              position: {
                ...node.position,
                y: node.position.y - yOffset,
              },
            })),
          prevNodes
        )
      )
    },
    [setNodes]
  )

  useEffect(() => {
    const payload = buildAirdropNodes({
      dataFlowHeight: containerHeight,
      dataFlowWidth: containerWidth,
      airdrops,
      onScroll: ({ scrollTop }) => handleNodesScrolled(payload, NODE_COLUMN_TYPES.AIRDROPS, scrollTop),
    })

    handleNodesChanged(payload, NODE_COLUMN_TYPES.AIRDROPS)
  }, [containerHeight, containerWidth, airdrops, handleNodesScrolled, handleNodesChanged])

  useEffect(() => {
    const payload = buildMonthNodes({
      dataFlowHeight: containerHeight,
      dataFlowWidth: containerWidth,
      months,
      onScroll: ({ scrollTop }) => handleNodesScrolled(payload, NODE_COLUMN_TYPES.ACTIVE_MONTHS, scrollTop),
    })

    handleNodesChanged(payload, NODE_COLUMN_TYPES.ACTIVE_MONTHS)
  }, [containerHeight, containerWidth, months, handleNodesScrolled, handleNodesChanged])

  useEffect(() => {
    const payload = buildTransactionNodes({
      dataFlowHeight: containerHeight,
      dataFlowWidth: containerWidth,
      transactions,
      onScroll: ({ scrollTop }) => handleNodesScrolled(payload, NODE_COLUMN_TYPES.TRANSACTIONS, scrollTop),
    })

    handleNodesChanged(payload, NODE_COLUMN_TYPES.TRANSACTIONS)
  }, [containerHeight, containerWidth, transactions, handleNodesScrolled, handleNodesChanged])

  useEffect(() => {
    const payload = buildRecipientNodes({
      dataFlowHeight: containerHeight,
      dataFlowWidth: containerWidth,
      recipients,
      onScroll: ({ scrollTop }) => handleNodesScrolled(payload, NODE_COLUMN_TYPES.RECIPIENTS, scrollTop),
    })

    handleNodesChanged(payload, NODE_COLUMN_TYPES.RECIPIENTS)
  }, [containerHeight, containerWidth, recipients, handleNodesScrolled, handleNodesChanged])

  useEffect(() => {
    const payload = buildEdges({
      dataFlowHeight: containerHeight,
      nodes,
      theme,
    })

    setEdges(payload)
  }, [containerHeight, nodes, theme, setEdges])

  return (
    <Container ref={containerRef} $heightToRemove={heightToRemove}>
      <DataFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
    </Container>
  )
}
