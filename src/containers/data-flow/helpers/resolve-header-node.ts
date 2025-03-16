import { CardanoLogo, RecipientIcon, SenderIcon, TransactionIcon } from '@/icons'
import { NODE_COLUMN_TYPES, NODE_TYPES } from '@/@types'
import type { NodePositions } from './get-node-positions'
import type { HeaderNodeProps } from '../nodes/header-node'
import { NOTIFICATION_TYPE } from '@odigos/ui-kit/types'

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
      status: [NODE_COLUMN_TYPES.RECIPIENTS, NODE_COLUMN_TYPES.TRANSACTIONS].includes(type) ? NOTIFICATION_TYPE.WARNING : undefined,
    } as HeaderNodeProps['data'],
  }
}
