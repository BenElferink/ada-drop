import type { TokenName } from '@/@types'

export const getTokenName = (tokenName?: TokenName) => {
  if (!tokenName) return 'Unknown Token'

  return tokenName.ticker || tokenName.display || tokenName.onChain
}
