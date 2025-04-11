import { NODE_COLUMN_TYPES } from '@/@types'
import nodeConfig from '@/containers/data-flow/helpers/node-config'
import type { BaseNodeProps } from '@/containers/data-flow/nodes/base-node'
import type { NodePositions } from '@/containers/data-flow/helpers/get-node-positions'

export const mapToNodeData = ({
  type,
  timestamp,
  airdropId,
  txHash,
  stakeKey,
  status,
  faded,
  iconSrc,
  title,
  subTitle,
  withClick,
  positions,
  idx,
}: Pick<BaseNodeProps['data'], 'timestamp' | 'airdropId' | 'txHash' | 'stakeKey' | 'title' | 'subTitle' | 'withClick' | 'status' | 'faded'> & {
  type: NODE_COLUMN_TYPES
  iconSrc: string
  positions: NodePositions
  idx: number
}) => {
  return {
    timestamp,
    airdropId,
    txHash,
    stakeKey,
    status,
    faded,
    title,
    subTitle,
    iconSrcs: !!iconSrc ? [iconSrc] : undefined,
    withClick,
    position: {
      x: nodeConfig.nodePadding,
      y: positions[type]['y'](idx) - (nodeConfig.nodeHeight - nodeConfig.nodePadding / 2),
    },
  } as BaseNodeProps['data']
}
