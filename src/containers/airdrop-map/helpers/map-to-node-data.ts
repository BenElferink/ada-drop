import { CardanoLogo } from '@/components'
import type { BaseNodeProps } from '../nodes/base-node'

export const mapToNodeData = ({
  airdropId,
  iconSrc,
  title,
  subTitle,
  withClick,
}: Pick<BaseNodeProps['data'], 'airdropId' | 'title' | 'subTitle' | 'withClick'> & { iconSrc: string }) => {
  return {
    airdropId,
    status: undefined,
    faded: undefined,
    title,
    subTitle,
    icons: !iconSrc ? [CardanoLogo] : undefined,
    iconSrcs: !!iconSrc ? [iconSrc] : undefined,
    withClick,
  } as BaseNodeProps['data']
}
