import { CardanoLogo, TransactionIcon, WalletInIcon, WalletOutIcon } from '@/icons'
import { StatusType } from '@odigos/ui-kit/types'
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
          ? WalletInIcon
          : type === NODE_COLUMN_TYPES.TRANSACTIONS
          ? TransactionIcon
          : type === NODE_COLUMN_TYPES.AIRDROPS
          ? WalletOutIcon
          : CardanoLogo,
      title: type,
      badge,
      isFetching: !badge,
      status: [NODE_COLUMN_TYPES.RECIPIENTS, NODE_COLUMN_TYPES.TRANSACTIONS].includes(type) ? StatusType.Warning : undefined,
    } as HeaderNodeProps['data'],
  }
}
