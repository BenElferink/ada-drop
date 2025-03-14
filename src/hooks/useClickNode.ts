import type { MouseEvent } from 'react'
import type { Node } from '@xyflow/react'
import { NODE_COLUMN_TYPES } from '@/@types'
import { getExplorerUrl } from '@/functions'
import type { BaseNodeProps } from '@/containers/airdrop-map/nodes/base-node'

const useClickNode = () => {
  const onClickNode: (event: MouseEvent, object: Node) => void = (_, { id: nodeId, data: { withClick, ...data } }) => {
    if (!withClick) return

    const { airdropId, txHash, stakeKey } = data as BaseNodeProps['data']
    const columnType = nodeId.split('$')[0] as NODE_COLUMN_TYPES

    if (!!airdropId) {
      switch (columnType) {
        case NODE_COLUMN_TYPES.AIRDROPS: {
          if (!!stakeKey) window.open(getExplorerUrl('stakeKey', stakeKey), '_blank', 'noopener noreferrer')
          else console.error('node does not have stakeKey', nodeId)
          break
        }

        case NODE_COLUMN_TYPES.TRANSACTIONS: {
          if (!!txHash) window.open(getExplorerUrl('tx', txHash), '_blank', 'noopener noreferrer')
          else console.error('node does not have txHash', nodeId)
          break
        }

        case NODE_COLUMN_TYPES.RECIPIENTS: {
          if (!!stakeKey) window.open(getExplorerUrl('stakeKey', stakeKey), '_blank', 'noopener noreferrer')
          else console.error('node does not have stakeKey', nodeId)
          break
        }

        default:
          console.warn('clicked node with undhandled columnType', nodeId)
          break
      }
    } else {
      console.warn('clicked node with no airdropId', nodeId)
    }
  }

  return { onClickNode }
}

export { useClickNode }
