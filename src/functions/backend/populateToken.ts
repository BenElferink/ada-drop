import blockfrost from '@/utils/blockfrost'
import { deepClone } from '@odigos/ui-kit/functions'
import { ADA, POPULATED_LOVELACE } from '@/constants'
import type { PopulatedToken, TokenId } from '@/@types'
import resolveTokenRegisteredMetadata from './resolveTokenRegisteredMetadata'
import { formatIpfsReference, formatTokenAmountFromChain, fromHex, numbersFromString, splitTokenId } from '..'

const populateToken = async (tokenId: TokenId, options?: { populateMintTx?: boolean; quantity?: string }): Promise<PopulatedToken> => {
  if (tokenId === 'lovelace') {
    const lovelaces = options?.quantity ? Number(options.quantity) : 0

    const payload = {
      ...deepClone(POPULATED_LOVELACE),
      tokenAmount: {
        onChain: lovelaces,
        display: formatTokenAmountFromChain(lovelaces, ADA['DECIMALS']),
        decimals: ADA['DECIMALS'],
      },
    }

    return payload
  }

  const populateMintTx = options?.populateMintTx || false

  const {
    policy_id: policyId,
    fingerprint,
    asset_name,
    quantity,
    onchain_metadata_standard,
    onchain_metadata,
    metadata,
    initial_mint_tx_hash,
  } = await blockfrost.assetsById(tokenId)

  const tokenAmountOnChain = Number(quantity)
  let tokenAmountDecimals = 0

  const tokenNameOnChain = !!asset_name ? fromHex(asset_name) : splitTokenId(tokenId, policyId).tokenName
  const tokenNameDisplay = onchain_metadata?.name?.toString() || metadata?.name?.toString() || ''
  let tokenNameTicker = ''

  const isFungible = tokenAmountOnChain > 1

  if (isFungible) {
    const { decimals, ticker } = await resolveTokenRegisteredMetadata(tokenId, metadata)

    tokenAmountDecimals = decimals
    tokenNameTicker = ticker
  }

  const thumb = onchain_metadata?.image
    ? Array.isArray(onchain_metadata.image)
      ? onchain_metadata.image.join('')
      : onchain_metadata.image.toString()
    : metadata?.logo
    ? `data:image/png;base64,${metadata?.logo}`
    : ''

  const image =
    thumb.indexOf('data:') === 0 || thumb.indexOf('https:') === 0
      ? {
          ipfs: '',
          url: thumb,
        }
      : formatIpfsReference(thumb.replaceAll(',', ''))

  const files = (
    !!onchain_metadata?.files
      ? Array.isArray(onchain_metadata.files)
        ? onchain_metadata.files
        : typeof onchain_metadata.files === 'object'
        ? [onchain_metadata.files]
        : []
      : []
  ).map((file) => ({
    ...file,
    src: formatIpfsReference(Array.isArray(file.src) ? file.src.join('') : file.src.toString()).ipfs,
  }))

  const forbiddenAttributeKeys = [
    'project',
    'collection',
    'name',
    'description',
    'logo',
    'image',
    'mediatype',
    'files',
    'decimals',
    'ticker',

    'link',
    'links',
    'url',
    'website',
    'twitter',
    'discord',
    'youtube',
    'instagram',
    'telegram',
  ]

  const attributes: PopulatedToken['attributes'] = {}

  Object.entries(onchain_metadata?.attributes || onchain_metadata || metadata || {}).forEach(([key, val]) => {
    const keyLower = key.toLowerCase()

    if (!forbiddenAttributeKeys.includes(keyLower)) {
      if (onchain_metadata_standard === 'CIP68v1') {
        attributes[keyLower] = fromHex(val?.toString() || 'X').slice(1)
      } else {
        if (typeof val === 'object' && !Array.isArray(val)) {
          Object.entries(val).forEach(([subKey, subVal]) => {
            const subKeyLower = subKey.toLowerCase()

            if (!forbiddenAttributeKeys.includes(subKeyLower)) {
              attributes[subKeyLower] = subVal?.toString()
            }
          })
        } else {
          attributes[keyLower] = val?.toString()
        }
      }
    }
  })

  const payload: PopulatedToken = {
    tokenId,
    fingerprint,
    isFungible,
    policyId,
    serialNumber: numbersFromString(tokenNameDisplay) || numbersFromString(tokenNameOnChain) || undefined,
    mintTransactionId: initial_mint_tx_hash,
    mintBlockHeight: undefined,
    tokenAmount: {
      onChain: tokenAmountOnChain,
      decimals: tokenAmountDecimals,
      display: formatTokenAmountFromChain(tokenAmountOnChain, tokenAmountDecimals),
    },
    tokenName: {
      onChain: tokenNameOnChain,
      ticker: tokenNameTicker,
      display: tokenNameDisplay,
    },
    image,
    files,
    attributes,
  }

  if (populateMintTx) {
    const tx = await blockfrost.txs(payload.mintTransactionId)

    payload.mintBlockHeight = tx.block_height
  } else {
    payload.mintBlockHeight = undefined
    delete payload.mintBlockHeight
  }

  if (!payload.serialNumber) {
    payload.serialNumber = undefined
    delete payload.serialNumber
  }

  return payload
}

export default populateToken
