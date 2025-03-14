import React, { FC, useCallback, useEffect, type CSSProperties } from 'react'
import { useAirdrops } from '@/hooks'
import { NODE_TYPES } from '@/@types'
import styled from 'styled-components'
import { DataFlow } from './data-flow'
import { buildNodes } from './helpers/build-nodes'
import { useContainerSize } from '@odigos/ui-kit/hooks'
import { applyNodeChanges, Edge, Node, useEdgesState, useNodesState } from '@xyflow/react'

interface AirdropMapProps {
  heightToRemove: CSSProperties['height']
}

const Container = styled.div<{ $heightToRemove: AirdropMapProps['heightToRemove'] }>`
  width: 100%;
  height: ${({ $heightToRemove }) => `calc(100vh - ${$heightToRemove})`};
  position: relative;
`

export const AirdropMap: FC<AirdropMapProps> = ({ heightToRemove }) => {
  const { airdrops } = useAirdrops()

  // useEffect(() => {
  //   if (!!airdrops.length) {
  //     const payload: {
  //       [year: string]: {
  //         [month: string]: Airdrop[]
  //       }
  //     } = {}

  //     airdrops.forEach((item) => {
  //       const date = new Date(item.timestamp)
  //       const y = date.getFullYear().toString()
  //       const m = date.getMonth().toString()

  //       if (payload[y]) {
  //         if (payload[y][m]) {
  //           payload[y][m].push(item)
  //         } else {
  //           payload[y][m] = [item]
  //         }
  //       } else {
  //         payload[y] = { [m]: [item] }
  //       }
  //     })

  //     console.log('airdropTimeline', payload)
  //   }
  // }, [airdrops])

  const { containerRef, containerHeight, containerWidth } = useContainerSize()

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[])

  const handleNodesScrolled = useCallback(
    (currNodes: Node[], yOffset: number) => {
      setNodes((prevNodes) =>
        applyNodeChanges(
          currNodes
            .filter((node) => node.extent === 'parent' && node.parentId?.includes(`-${NODE_TYPES.SCROLL}`))
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
    const payload = buildNodes({
      dataFlowHeight: containerHeight,
      dataFlowWidth: containerWidth,
      airdrops,
      onScroll: ({ scrollTop }) => handleNodesScrolled(payload, scrollTop),
    })

    setNodes(payload)
    // setNodes((prevNodes) => {
    //   const payload = [...prevNodes].filter(({ id }) => id.split('-')[0] !== key);
    //   payload.push(...currNodes);
    //   return payload;
    // });
  }, [containerHeight, containerWidth, airdrops, setNodes, handleNodesScrolled])

  useEffect(() => {
    // const payload = buildEdges({
    //   theme,
    //   nodes,
    //   metrics,
    //   containerHeight,
    // })

    const payload: typeof edges = []

    setEdges(payload)
  }, [setEdges])

  return (
    <Container ref={containerRef} $heightToRemove={heightToRemove}>
      <DataFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} />
    </Container>
  )

  // return (
  //   <>
  //     {!airdrops.length ? (
  //       <CenterThis style={{ height: '50vh' }}>
  //         <FadeLoader scale={1.5} />
  //       </CenterThis>
  //     ) : (
  //       <DataFlow nodes={[]} edges={[]} onNodesChange={() => {}} onEdgesChange={() => {}} />
  //       // Object.entries(airdropTimeline).map(([year, months]) =>
  //       //   Object.entries(months).map(([month, drops]) => (
  //       //     <div key={`year-${year}-month-${month}`} className='my-2'>
  //       //       <div>
  //       //         {resolveMonthName(month)} - {year}
  //       //       </div>

  //       //       <div>
  //       //         {drops.map((drop) => (
  //       //           <div key={`drop-${drop.id}`}>
  //       //             {drop.tokenName.display}: {drop.tokenAmount.display}
  //       //           </div>
  //       //         ))}
  //       //       </div>
  //       //     </div>
  //       //   ))
  //       // )
  //     )}
  //   </>
  // )
}
