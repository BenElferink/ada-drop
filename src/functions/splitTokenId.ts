import { fromHex } from './formatHex'
import type { PolicyId, TokenId } from '@/@types'

const CIP68_PREFIXES_LENGTH = 8

enum Cip68Prefixes {
  NFT = '000de140',
  REF = '000643b0',
}

enum Cip68TokenTypes {
  NFT = '222',
  REF = '100',
}

export const splitTokenId = (tokenId: TokenId, policyId: PolicyId) => {
  if (!tokenId.startsWith(policyId)) throw new Error('Invalid tokenId: does not start with policyId')

  let tokenType = ''
  let tokenName = ''

  const tokenNameHex = tokenId.replace(policyId, '')
  if (!tokenNameHex) return { tokenType, tokenName }

  switch (tokenNameHex.substring(0, CIP68_PREFIXES_LENGTH)) {
    case Cip68Prefixes.NFT:
      tokenType = Cip68TokenTypes.NFT
      break

    case Cip68Prefixes.REF:
      tokenType = Cip68TokenTypes.REF
      break

    default:
      tokenType = ''
      break
  }

  if ([Cip68TokenTypes.NFT, Cip68TokenTypes.REF].includes(tokenType as Cip68TokenTypes)) {
    tokenName = fromHex(tokenNameHex.substring(CIP68_PREFIXES_LENGTH))
  } else {
    tokenName = fromHex(tokenNameHex)
  }

  return { tokenType, tokenName }
}
