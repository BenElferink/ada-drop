import type { NextApiRequest, NextApiResponse } from 'next'
import blockfrost from '@/utils/blockfrost'
import type { PoolDelegators } from '@/@types'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse<PoolDelegators>) => {
  const { method, query } = req

  const poolId = query.pool_id?.toString()
  const page = Number(query.page || 1)

  if (!poolId) return res.status(400).end()
  if (poolId.indexOf('pool1') !== 0) return res.status(400).end(`Please use a BECH 32 stake pool ID (starts with "pool1"...) ${poolId}`)

  try {
    switch (method) {
      case 'GET': {
        const delegators = await blockfrost.poolsByIdDelegators(poolId, {
          count: 100,
          page,
          order: 'asc',
        })

        const payload: PoolDelegators = {
          poolId,
          page,
          delegators: delegators.map((item) => ({
            stakeKey: item.address,
            delegatedLovelaces: Number(item.live_stake),
          })),
        }

        return res.status(200).json(payload)
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error)

    if (['The requested component has not been found.', 'Invalid or malformed pool id format.'].includes(error?.message)) {
      return res.status(400).end(`${error.message} ${poolId}`)
    }

    return res.status(500).end()
  }
}

export default handler
