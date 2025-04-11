import React, { memo } from 'react'
import styled from 'styled-components'
import { NODE_TYPES } from '@/@types'
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react'
import nodeConfig from '../helpers/node-config'

export type FrameNodeProps = NodeProps<
  Node<
    {
      numberOfNodes: number
    },
    NODE_TYPES.FRAME
  >
>

const Container = styled.div<{ $numberOfNodes: FrameNodeProps['data']['numberOfNodes'] }>`
  width: ${nodeConfig.nodeWidth + 2 * nodeConfig.nodePadding}px;
  height: ${({ $numberOfNodes }) => nodeConfig.nodeHeight * $numberOfNodes + nodeConfig.nodePadding}px;
  background: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 24px;
`

const FrameNode: React.FC<FrameNodeProps> = memo(({ data }) => {
  const { numberOfNodes } = data

  return (
    <Container $numberOfNodes={numberOfNodes} className='nowheel nodrag'>
      <Handle type='source' position={Position.Right} style={{ visibility: 'hidden' }} />
      <Handle type='target' position={Position.Left} style={{ visibility: 'hidden' }} />
    </Container>
  )
})

FrameNode.displayName = 'FrameNode'
export default FrameNode
