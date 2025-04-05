import type { NextApiRequest, NextApiResponse } from 'next'
import blockfrost from '@/utils/blockfrost'
import type { Owner, TokenOwners } from '@/@types'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse<TokenOwners>) => {
  const { method, query } = req

  const tokenId = query.token_id?.toString()
  const page = Number(query.page || 1)

  if (!tokenId) return res.status(400).end()

  try {
    switch (method) {
      case 'GET': {
        const assetAddresses = await blockfrost.assetsAddresses(tokenId, {
          count: 100,
          page,
          order: 'asc',
        })

        const payload: Owner[] = []

        for await (const { address, quantity } of assetAddresses) {
          const wallet = await blockfrost.addresses(address)
          const stakeKey = wallet.stake_address || ''

          const owner: Owner = {
            quantity: Number(quantity),
            stakeKey,
            addresses: [
              {
                address: wallet.address,
                isScript: wallet.script,
              },
            ],
          }

          payload.push(owner)
        }

        return res.status(200).json({
          tokenId,
          page,
          owners: payload,
        })
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error: any) {
    console.error(error)

    if (['The requested component has not been found.', 'Invalid or malformed asset format.'].includes(error?.message)) {
      return res.status(404).end(`Token not found: ${tokenId}`)
    }

    return res.status(500).end()
  }
}

export default handler
