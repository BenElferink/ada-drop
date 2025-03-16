import blockfrost from '@/utils/blockfrost'
import cardanoTokenRegistry from '@/utils/cardano-token-registry'
import type { components } from '@blockfrost/openapi'

const resolveTokenRegisteredMetadata = async (tokenId: string, metadata?: components['schemas']['asset']['metadata']) => {
  let decimals: number | null = null
  let ticker: string | null = null

  if (metadata && metadata.decimals != null) decimals = metadata.decimals
  if (metadata && metadata.ticker != null) ticker = metadata.ticker

  if (decimals == null || ticker == null) {
    try {
      const ctrToken = await cardanoTokenRegistry.getTokenInformation(tokenId)

      decimals = ctrToken.decimals
      ticker = ctrToken.ticker
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const bfToken = await blockfrost.assetsById(tokenId)

      decimals = bfToken?.metadata?.decimals || 0
      ticker = bfToken?.metadata?.ticker || ''
    }
  }

  return {
    decimals,
    ticker,
  }
}

export default resolveTokenRegisteredMetadata
