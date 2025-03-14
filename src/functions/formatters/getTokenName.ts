import type { TokenName } from '@/@types'

export const getTokenName = (tokenName: TokenName) => {
  return tokenName.ticker || tokenName.display || tokenName.onChain
}
