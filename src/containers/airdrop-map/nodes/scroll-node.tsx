import React, { memo, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useClickNode } from '@/hooks'
import type { Node, NodeProps } from '@xyflow/react'
import { NODE_TYPES, type OnScroll } from '@/@types'
import BaseNode, { type BaseNodeProps } from './base-node'
import nodeConfig from '../helpers/node-config'

export type ScrollNodeProps = NodeProps<
  Node<
    {
      dataFlowHeight: number
      items: BaseNodeProps[]
      onScroll: OnScroll
    },
    NODE_TYPES.SCROLL
  >
>

const Container = styled.div<{ $dataFlowHeight: number }>`
  position: relative;
  width: ${nodeConfig.nodeWidth}px;
  height: ${({ $dataFlowHeight }) => $dataFlowHeight - nodeConfig.nodeHeight + nodeConfig.nodePadding * 2}px;
  background: transparent;
  border: none;
  overflow-y: auto;
`

const BaseNodeWrapper = styled.div`
  margin: ${nodeConfig.nodePadding} 0;
`

const Overlay = styled.div<{ $hide?: boolean }>`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 100%;
  height: 100px;
  padding-bottom: 12px;

  background: ${({ theme, $hide }) => ($hide ? 'transparent' : `linear-gradient(to top, ${theme.colors.primary}, transparent)`)};
  display: flex;
  align-items: flex-end;
  justify-content: center;

  pointer-events: none;
`

const ScrollNode: React.FC<ScrollNodeProps> = memo(({ data }) => {
  const { dataFlowHeight, items, onScroll } = data
  const { onClickNode } = useClickNode()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isBottomOfList, setIsBottomOfList] = useState(false)

  useEffect(() => {
    const handleScroll = (e: Event) => {
      e.stopPropagation()

      const { clientHeight, scrollHeight, scrollTop } = e.target as HTMLDivElement
      if (!!onScroll) onScroll({ clientHeight, scrollHeight, scrollTop })

      const isBottom = scrollHeight - scrollTop <= clientHeight
      setIsBottomOfList(isBottom)
    }

    const { current } = containerRef

    current?.addEventListener('scroll', handleScroll)
    return () => current?.removeEventListener('scroll', handleScroll)
  }, [onScroll])

  return (
    <Container ref={containerRef} $dataFlowHeight={dataFlowHeight} className='nowheel nodrag'>
      {items.map((n) => {
        const { id, data, ...rest } = n

        return (
          <BaseNodeWrapper
            key={id}
            onClick={
              data.withClick
                ? (e) => {
                    e.stopPropagation()
                    // @ts-expect-error - node changing type
                    onClickNode(e, n)
                  }
                : undefined
            }
          >
            <BaseNode {...rest} type={NODE_TYPES.BASE} id={id} data={data} />
          </BaseNodeWrapper>
        )
      })}

      <Overlay $hide={isBottomOfList} />
    </Container>
  )
})

ScrollNode.displayName = 'ScrollNode'
export default ScrollNode
