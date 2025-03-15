import React, { FC, useCallback, useEffect, type CSSProperties } from 'react'
import styled from 'styled-components'
import { DataFlow } from './data-flow'
import Theme from '@odigos/ui-kit/theme'
import { useContainerSize } from '@odigos/ui-kit/hooks'
import { useAirdrops, UseAirdropsExtended } from '@/hooks'
import { buildMonthNodes } from './helpers/build-month-nodes'
import { buildAirdropNodes } from './helpers/build-airdrop-nodes'
import { buildRecipientNodes } from './helpers/build-recipient-nodes'
import { buildTransactionNodes } from './helpers/build-transactions-nodes'
import { NODE_COLUMN_TYPES, NODE_TYPES, type OnScrollParams } from '@/@types'
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
    (currNodes: Node[], newNodes: Node[], key: NODE_COLUMN_TYPES, onScrollParams: OnScrollParams) => {
      const { scrollTop: yOffset } = onScrollParams

      const hasNew = !!newNodes.find(({ id: newId }) => !currNodes.find(({ id: oldId }) => oldId === newId))
      if (hasNew) return handleNodesChanged(newNodes, key)

      setNodes((prevNodes) => {
        const changed = applyNodeChanges(
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

        return changed
      })
    },
    [setNodes, handleNodesChanged]
  )

  useEffect(() => {
    const build = (scrollParams?: OnScrollParams) => {
      const payload = buildAirdropNodes({
        dataFlowHeight: containerHeight,
        dataFlowWidth: containerWidth,
        airdrops,
        onScroll: (params) => handleNodesScrolled(payload, build(params), NODE_COLUMN_TYPES.AIRDROPS, params),
        scrollParams,
      })

      return payload
    }

    handleNodesChanged(build(), NODE_COLUMN_TYPES.AIRDROPS)
  }, [containerHeight, containerWidth, airdrops, handleNodesScrolled, handleNodesChanged])

  useEffect(() => {
    const build = (scrollParams?: OnScrollParams) => {
      const payload = buildMonthNodes({
        dataFlowHeight: containerHeight,
        dataFlowWidth: containerWidth,
        months,
        onScroll: (params) => handleNodesScrolled(payload, build(params), NODE_COLUMN_TYPES.ACTIVE_MONTHS, params),
        scrollParams,
      })

      return payload
    }

    handleNodesChanged(build(), NODE_COLUMN_TYPES.ACTIVE_MONTHS)
  }, [containerHeight, containerWidth, months, handleNodesScrolled, handleNodesChanged])

  useEffect(() => {
    const build = (scrollParams?: OnScrollParams) => {
      const payload = buildTransactionNodes({
        dataFlowHeight: containerHeight,
        dataFlowWidth: containerWidth,
        transactions,
        onScroll: (params) => handleNodesScrolled(payload, build(params), NODE_COLUMN_TYPES.TRANSACTIONS, params),
        scrollParams,
      })

      return payload
    }

    handleNodesChanged(build(), NODE_COLUMN_TYPES.TRANSACTIONS)
  }, [containerHeight, containerWidth, transactions, handleNodesScrolled, handleNodesChanged])

  useEffect(() => {
    const build = (scrollParams?: OnScrollParams) => {
      const payload = buildRecipientNodes({
        dataFlowHeight: containerHeight,
        dataFlowWidth: containerWidth,
        recipients,
        onScroll: (params) => handleNodesScrolled(payload, build(params), NODE_COLUMN_TYPES.RECIPIENTS, params),
        scrollParams,
      })

      return payload
    }

    handleNodesChanged(build(), NODE_COLUMN_TYPES.RECIPIENTS)
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
