import blockfrost from '@/utils/blockfrost'
import cardanoTokenRegistry from '@/utils/cardano-token-registry'
import type { components } from '@blockfrost/openapi'

interface TokenMetadata {
  ticker: string
  decimals: number
}

const resolveTokenRegisteredMetadata = async (tokenId: string, metadata?: components['schemas']['asset']['metadata']): Promise<TokenMetadata> => {
  let ticker: TokenMetadata['ticker'] | null | undefined = null
  let decimals: TokenMetadata['decimals'] | null | undefined = null

  if (metadata && metadata.ticker != null) ticker = metadata.ticker
  if (metadata && metadata.decimals != null) decimals = metadata.decimals

  if (ticker == null || decimals == null) {
    try {
      const ctrToken = await cardanoTokenRegistry.getTokenInformation(tokenId)

      ticker = ctrToken.ticker?.value
      decimals = ctrToken.decimals?.value
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const bfToken = await blockfrost.assetsById(tokenId)

      ticker = bfToken?.metadata?.ticker
      decimals = bfToken?.metadata?.decimals
    }
  }

  return {
    ticker: ticker || '',
    decimals: decimals || 0,
  }
}

export default resolveTokenRegisteredMetadata
