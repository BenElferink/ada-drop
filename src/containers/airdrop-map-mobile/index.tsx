import React, { FC, useCallback, useEffect, type CSSProperties } from 'react'
import { useAirdrops } from '@/hooks'
import styled from 'styled-components'
import { DataFlow } from '../data-flow'
import { useAirdropStore } from '@/store'
import { useContainerSize } from '@odigos/ui-kit/hooks'
import { applyNodeChanges, type Node, useNodesState } from '@xyflow/react'
import { buildAirdropNodes } from '../data-flow/helpers/build-airdrop-nodes'
import { NODE_COLUMN_TYPES, NODE_TYPES, type OnScrollParams } from '@/@types'

interface AirdropMapMobileProps {
  heightToRemove: CSSProperties['height']
}

const Container = styled.div<{ $heightToRemove: AirdropMapMobileProps['heightToRemove'] }>`
  width: 100%;
  height: ${({ $heightToRemove }) => `calc(100vh - ${$heightToRemove})`};
  position: relative;
`

export const AirdropMapMobile: FC<AirdropMapMobileProps> = ({ heightToRemove }) => {
  const { airdrops } = useAirdrops()
  const { selectedAirdropId } = useAirdropStore()
  const { containerRef, containerHeight, containerWidth } = useContainerSize()

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])

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
        isMobile: true,
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

  return (
    <Container ref={containerRef} $heightToRemove={heightToRemove}>
      <DataFlow nodes={nodes} edges={[]} onNodesChange={onNodesChange} onEdgesChange={() => {}} />
    </Container>
  )
}
