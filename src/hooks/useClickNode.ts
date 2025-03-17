import type { MouseEvent } from 'react'
import { useMobile } from './useMobile'
import type { Node } from '@xyflow/react'
import { useAirdropStore } from '@/store'
import { NODE_COLUMN_TYPES } from '@/@types'
import type { BaseNodeProps } from '@/containers/data-flow/nodes/base-node'

const useClickNode = () => {
  const { isMobile } = useMobile()
  const { selectedAirdropId, setSelectedAirdropId } = useAirdropStore()

  const onClickNode: (event: MouseEvent, object: Node) => void = (_, { id: nodeId, data: { withClick, ...data } }) => {
    if (!withClick || isMobile) return

    const { airdropId, txHash, stakeKey } = data as BaseNodeProps['data']
    const columnType = nodeId.split('$')[0] as NODE_COLUMN_TYPES

    if (!!airdropId) {
      switch (columnType) {
        case NODE_COLUMN_TYPES.AIRDROPS: {
          if (!stakeKey) {
            console.error('node does not have stakeKey', nodeId)
            break
          }

          if (!selectedAirdropId || selectedAirdropId !== airdropId) {
            setSelectedAirdropId(airdropId)
          } else {
            setSelectedAirdropId('')
            // window.open(getExplorerUrl('stakeKey', stakeKey), '_blank', 'noopener noreferrer')
          }
          break
        }

        case NODE_COLUMN_TYPES.TRANSACTIONS: {
          if (!txHash) {
            console.error('node does not have txHash', nodeId)
            break
          }

          if (!selectedAirdropId || selectedAirdropId !== airdropId) {
            setSelectedAirdropId(airdropId)
          } else {
            setSelectedAirdropId('')
            // window.open(getExplorerUrl('tx', txHash), '_blank', 'noopener noreferrer')
          }
          break
        }

        case NODE_COLUMN_TYPES.RECIPIENTS: {
          if (!stakeKey) {
            console.error('node does not have stakeKey', nodeId)
            break
          }

          if (!selectedAirdropId || selectedAirdropId !== airdropId) {
            setSelectedAirdropId(airdropId)
          } else {
            setSelectedAirdropId('')
            // window.open(getExplorerUrl('stakeKey', stakeKey), '_blank', 'noopener noreferrer')
          }
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
