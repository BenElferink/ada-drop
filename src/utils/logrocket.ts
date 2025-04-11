import LogRocket from 'logrocket'
import { LOG_ROCKET_PROJECT_ID } from '@/constants'

LogRocket.init(LOG_ROCKET_PROJECT_ID || '')

export const logId = (walletId: string) => LogRocket.identify(walletId)
