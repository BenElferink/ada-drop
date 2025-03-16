import React, { FC, useCallback, useEffect, type CSSProperties } from 'react'
import styled from 'styled-components'
import { DataFlow } from '../data-flow'
import Theme from '@odigos/ui-kit/theme'
import { useAirdropStore } from '@/store'
import { useContainerSize } from '@odigos/ui-kit/hooks'
import { useAirdrops, UseAirdropsExtended } from '@/hooks'
import { buildEdges } from '../data-flow/helpers/build-edges'
import { buildMonthNodes } from '../data-flow/helpers/build-month-nodes'
import { buildAirdropNodes } from '../data-flow/helpers/build-airdrop-nodes'
import { NODE_COLUMN_TYPES, NODE_TYPES, type OnScrollParams } from '@/@types'
import { buildRecipientNodes } from '../data-flow/helpers/build-recipient-nodes'
import { buildTransactionNodes } from '../data-flow/helpers/build-transactions-nodes'
import { applyNodeChanges, type Edge, type Node, useEdgesState, useNodesState } from '@xyflow/react'

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
  const { selectedAirdropId } = useAirdropStore()
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
        selectedAirdropId,
        onScroll: (params) => handleNodesScrolled(payload, build(params), NODE_COLUMN_TYPES.AIRDROPS, params),
        scrollParams,
      })

      return payload
    }

    handleNodesChanged(build(), NODE_COLUMN_TYPES.AIRDROPS)
  }, [containerHeight, containerWidth, airdrops, selectedAirdropId, handleNodesScrolled, handleNodesChanged])

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
        selectedAirdropId,
        onScroll: (params) => handleNodesScrolled(payload, build(params), NODE_COLUMN_TYPES.TRANSACTIONS, params),
        scrollParams,
      })

      return payload
    }

    handleNodesChanged(build(), NODE_COLUMN_TYPES.TRANSACTIONS)
  }, [containerHeight, containerWidth, transactions, selectedAirdropId, handleNodesScrolled, handleNodesChanged])

  useEffect(() => {
    const build = (scrollParams?: OnScrollParams) => {
      const payload = buildRecipientNodes({
        dataFlowHeight: containerHeight,
        dataFlowWidth: containerWidth,
        recipients,
        selectedAirdropId,
        onScroll: (params) => handleNodesScrolled(payload, build(params), NODE_COLUMN_TYPES.RECIPIENTS, params),
        scrollParams,
      })

      return payload
    }

    handleNodesChanged(build(), NODE_COLUMN_TYPES.RECIPIENTS)
  }, [containerHeight, containerWidth, recipients, selectedAirdropId, handleNodesScrolled, handleNodesChanged])

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
