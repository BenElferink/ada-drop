import type { NextApiRequest, NextApiResponse } from 'next'
import blockfrost from '@/utils/blockfrost'
import type { BaseToken, PolicyInfo, RankedToken } from '@/@types'
import cnftTools, { type CnftToolsPolicy } from '@/utils/cnft-tools'
import { formatTokenAmountFromChain, splitTokenId } from '@/functions'
import resolveTokenRegisteredMetadata from '@/functions/backend/resolveTokenRegisteredMetadata'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse<PolicyInfo>) => {
  const { method, query } = req

  const policyId = query.policy_id?.toString()
  const allTokens = !!query.all_tokens && query.all_tokens == 'true'
  const withBurned = !!query.with_burned && query.with_burned == 'true'
  const withRanks = !!query.with_ranks && query.with_ranks == 'true'

  if (!policyId) return res.status(400).end()

  try {
    switch (method) {
      case 'GET': {
        let rankedAssets: CnftToolsPolicy = {}

        if (withRanks) {
          const fetched = await cnftTools.getPolicyRanks(policyId)
          if (!fetched) return res.status(400).end(`Policy ID does not have ranks on cnft.tools: ${policyId}`)

          rankedAssets = fetched
        }

        const fetchedTokens = allTokens ? await blockfrost.assetsPolicyByIdAll(policyId) : await blockfrost.assetsPolicyById(policyId)
        const tokens = []

        for await (const item of fetchedTokens) {
          const tokenId = item.asset
          const tokenAmountOnChain = Number(item.quantity)
          let tokenAmountDecimals = 0

          const isFungible = tokenAmountOnChain > 1
          const tokenNameOnChain = splitTokenId(tokenId, policyId).tokenName
          let tokenNameTicker = ''

          if (tokenAmountOnChain > 0 || withBurned) {
            if (isFungible) {
              const { decimals, ticker } = await resolveTokenRegisteredMetadata(tokenId)

              tokenAmountDecimals = decimals
              tokenNameTicker = ticker
            }

            const token: BaseToken = {
              tokenId,
              isFungible,
              tokenAmount: {
                onChain: tokenAmountOnChain,
                decimals: tokenAmountDecimals,
                display: formatTokenAmountFromChain(tokenAmountOnChain, tokenAmountDecimals),
              },
              tokenName: {
                onChain: tokenNameOnChain,
                ticker: tokenNameTicker,
                display: '',
              },
            }

            if (withRanks) {
              const tokenName = splitTokenId(tokenId, policyId).tokenName
              const rarityRank = Number(rankedAssets[tokenName] || 0)

              ;(token as RankedToken).rarityRank = rarityRank
            }

            tokens.push(token)
          }
        }

        return res.status(200).json({
          policyId,
          tokens,
        })
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error: any) {
    console.error(error)

    if (['The requested component has not been found.', 'Invalid or malformed policy format.'].includes(error?.message)) {
      return res.status(404).end(`Policy not found: ${policyId}`)
    }

    return res.status(500).end()
  }
}

export default handler
