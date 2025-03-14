import { CardanoLogo, RecipientIcon, SenderIcon, TransactionIcon } from '@/icons'
import { NODE_COLUMN_TYPES, NODE_TYPES } from '@/@types'
import type { NodePositions } from './get-node-positions'
import type { HeaderNodeProps } from '../nodes/header-node'

export const resolveHeaderNode = (positions: NodePositions, type: NODE_COLUMN_TYPES, badge: number) => {
  return {
    id: `${type}$${NODE_TYPES.HEADER}`,
    type: NODE_TYPES.HEADER,
    position: {
      x: positions[type]['x'],
      y: 0,
    },
    data: {
      icon:
        type === NODE_COLUMN_TYPES.RECIPIENTS
          ? RecipientIcon
          : type === NODE_COLUMN_TYPES.TRANSACTIONS
          ? TransactionIcon
          : type === NODE_COLUMN_TYPES.AIRDROPS
          ? SenderIcon
          : CardanoLogo,
      title: type,
      badge,
      isFetching: !badge,
    } as HeaderNodeProps['data'],
  }
}
