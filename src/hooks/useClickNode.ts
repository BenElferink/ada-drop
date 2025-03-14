import type { MouseEvent } from 'react'
import type { Node } from '@xyflow/react'
import { NODE_COLUMN_TYPES } from '@/@types'

const useClickNode = () => {
  const onClickNode: (event: MouseEvent, object: Node) => void = (_, { id: nodeId, data: { withClick, ...data } }) => {
    if (!withClick) return

    const { airdropId } = data
    const columnType = nodeId.split('$')[0] as NODE_COLUMN_TYPES

    if (!!airdropId) {
      console.log('clicked node', nodeId, airdropId)
    } else {
      console.warn('clicked node with no airdrop id', nodeId)
    }
  }

  return { onClickNode }
}

export { useClickNode }
