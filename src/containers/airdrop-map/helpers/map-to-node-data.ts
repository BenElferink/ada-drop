import { CardanoLogo } from '@/components'
import { NODE_COLUMN_TYPES } from '@/@types'
import type { BaseNodeProps } from '../nodes/base-node'
import type { NodePositions } from './get-node-positions'
import nodeConfig from './node-config'

export const mapToNodeData = ({
  type,
  airdropId,
  iconSrc,
  title,
  subTitle,
  withClick,
  positions,
  idx,
}: Pick<BaseNodeProps['data'], 'airdropId' | 'title' | 'subTitle' | 'withClick'> & {
  type: NODE_COLUMN_TYPES
  iconSrc: string
  positions: NodePositions
  idx: number
}) => {
  return {
    airdropId,
    status: undefined,
    faded: undefined,
    title,
    subTitle,
    icons: !iconSrc ? [CardanoLogo] : undefined,
    iconSrcs: !!iconSrc ? [iconSrc] : undefined,
    withClick,
    position: {
      x: nodeConfig.nodePadding,
      y: positions[type]['y'](idx) - (nodeConfig.nodeHeight - nodeConfig.nodePadding / 2),
    },
  } as BaseNodeProps['data']
}
