import { fromHex } from '../formatters/formatHex'
import type { PolicyId, TokenId } from '@/@types'

const splitTokenId = (tokenId: TokenId, policyId: PolicyId) => {
  const tokenLabel = tokenId.replace(policyId, '')

  let tokenType = ''

  switch (tokenLabel.substring(0, 8)) {
    case '000de140': // CIP-68 nft token
      tokenType = '222'
      break

    case '000643b0': // CIP-68 ref token
      tokenType = '100'
      break

    default:
      break
  }

  let tokenName = fromHex(tokenLabel)

  if (tokenName === tokenLabel) {
    tokenName = fromHex(tokenLabel.substring(8))

    if (tokenName === tokenLabel) {
      tokenName = tokenLabel
    }
  }

  return {
    tokenType,
    tokenName,
  }
}

export default splitTokenId
