import type { NextApiRequest, NextApiResponse } from 'next'
import slackWebhook from '@/utils/slack'
import type { AnyBlock } from '@slack/types'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse<void>) => {
  const { method, body } = req
  const { message, embed } = body

  try {
    switch (method) {
      case 'POST': {
        const blocks: AnyBlock[] = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${message}\n\`\`\`${embed}\`\`\``,
            },
          },
        ]

        if (message.includes('failed')) {
          blocks.push({
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Links:*\n<${'https://vercel.com/yulegent/ada-drop/logs'}|Vercel Logs>`,
              },
            ],
          })
        }

        await slackWebhook.send({ blocks })

        return res.status(204).end()
      }

      default: {
        res.setHeader('Allow', 'POST')
        return res.status(405).end()
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export default handler
