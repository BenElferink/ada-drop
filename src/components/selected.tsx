import { Status } from '@odigos/ui-kit/components'
import { STATUS_TYPE } from '@odigos/ui-kit/types'

export const Selected = () => {
  return <Status status={STATUS_TYPE.DEFAULT} title='Selected' withBorder />
}
