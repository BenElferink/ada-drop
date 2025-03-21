import { Status } from '@odigos/ui-kit/components'
import { StatusType } from '@odigos/ui-kit/types'

export const Selected = () => {
  return <Status status={StatusType.Default} title='Selected' withBorder />
}
