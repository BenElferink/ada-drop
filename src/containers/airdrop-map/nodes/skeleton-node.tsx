import React, { memo } from 'react'
import styled from 'styled-components'
import { NODE_TYPES } from '@/@types'
import { type Node, type NodeProps } from '@xyflow/react'
import { SkeletonLoader } from '@odigos/ui-kit/components'
import nodeConfig from '../helpers/node-config'

export type SkeletonNodeProps = NodeProps<
  Node<
    {
      dataFlowHeight: number
    },
    NODE_TYPES.SKELETON
  >
>

const Container = styled.div`
  width: ${nodeConfig.nodeWidth}px;
`

const SkeletonNode: React.FC<SkeletonNodeProps> = memo(({ data }) => {
  const { dataFlowHeight } = data

  return (
    <Container className='nowheel nodrag'>
      <SkeletonLoader size={Math.floor(dataFlowHeight / nodeConfig.nodeHeight)} />
    </Container>
  )
})

SkeletonNode.displayName = 'SkeletonNode'
export default SkeletonNode
