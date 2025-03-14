import React, { memo } from 'react'
import styled from 'styled-components'
import { NODE_TYPES } from '@/@types'
import { Handle, type Node, type NodeProps, Position } from '@xyflow/react'
import nodeConfig from '../helpers/node-config'

export type EdgedNodeProps = NodeProps<
  Node<
    {
      [key: string]: void
    },
    NODE_TYPES.EDGED
  >
>

const Container = styled.div`
  width: ${nodeConfig.nodeWidth}px;
  height: ${nodeConfig.nodeHeight}px;
  opacity: 0;
`

const EdgedNode: React.FC<EdgedNodeProps> = memo(() => {
  return (
    <Container>
      <Handle type='source' position={Position.Right} style={{ visibility: 'hidden' }} />
      <Handle type='target' position={Position.Left} style={{ visibility: 'hidden' }} />
    </Container>
  )
})

EdgedNode.displayName = 'EdgedNode'
export default EdgedNode
