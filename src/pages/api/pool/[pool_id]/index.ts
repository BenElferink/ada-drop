import type { NextApiRequest, NextApiResponse } from 'next'
import blockfrost from '@/utils/blockfrost'
import type { PoolInfo } from '@/@types'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse<PoolInfo>) => {
  const { method, query } = req

  const poolId = query.pool_id?.toString()

  if (!poolId) return res.status(400).end()
  if (poolId.indexOf('pool1') !== 0) return res.status(400).end(`Please use a BECH 32 stake pool ID (starts with "pool1"...) ${poolId}`)

  try {
    switch (method) {
      case 'GET': {
        const data = await blockfrost.poolMetadata(poolId)
        const ticker = data.ticker || ''

        const payload: PoolInfo = {
          poolId,
          ticker,
        }

        return res.status(200).json(payload)
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error: any) {
    console.error(error)

    if (['The requested component has not been found.', 'Invalid or malformed pool id format.'].includes(error?.message)) {
      return res.status(400).end(`${error.message} ${poolId}`)
    }

    return res.status(500).end()
  }
}

export default handler
