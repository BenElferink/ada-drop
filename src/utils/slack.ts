import { IncomingWebhook } from '@slack/webhook'
import { SLACK_WEBHOOK_URL } from '@/constants'

const slackWebhook = new IncomingWebhook(SLACK_WEBHOOK_URL || '')

export default slackWebhook
