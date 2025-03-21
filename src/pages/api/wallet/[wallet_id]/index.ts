import type { NextApiRequest, NextApiResponse } from 'next'
import blockfrost from '@/utils/blockfrost'
import type { BaseToken, Wallet } from '@/@types'
import { ERROR_TYPES, POLICY_IDS } from '@/constants'
import populateToken from '@/functions/backend/populateToken'
import { formatTokenAmountFromChain, fromHex, splitTokenId } from '@/functions'
import resolveWalletIdentifiers from '@/functions/backend/resolveWalletIdentifiers'
import resolveTokenRegisteredMetadata from '@/functions/backend/resolveTokenRegisteredMetadata'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Wallet>) => {
  const { method, query } = req

  const walletId = query.wallet_id?.toString()
  const allAddresses = !!query.all_addresses && query.all_addresses == 'true'
  const withStakePool = !!query.with_stake_pool && query.with_stake_pool == 'true'
  const withTokens = !!query.with_tokens && query.with_tokens == 'true'
  const populateTokens = !!query.populate_tokens && query.populate_tokens == 'true'

  try {
    switch (method) {
      case 'GET': {
        const { stakeKey, addresses } = await resolveWalletIdentifiers(walletId)

        const populatedAddresses = []
        const ownedUnitsByAddress = []

        for (let idx = 0; idx < addresses.length; idx++) {
          const addr = addresses[idx]
          const { script, amount } = await blockfrost.addresses(addr)

          populatedAddresses.push({
            address: addr,
            isScript: script,
          })

          ownedUnitsByAddress.push(...amount)

          if (!allAddresses) break
        }

        const wallet: Wallet = {
          stakeKey,
          addresses: populatedAddresses,
        }

        if (withStakePool && stakeKey) {
          const account = await blockfrost.accounts(stakeKey)
          const poolId = account.pool_id || ''

          wallet.poolId = poolId
        }

        if (withTokens) {
          const units = []

          if (stakeKey) {
            const ownedUnitsByStake = await blockfrost.accountsAddressesAssetsAll(stakeKey)

            units.push(...ownedUnitsByStake)
          } else {
            units.push(...ownedUnitsByAddress)
          }

          wallet.handles = []
          wallet.tokens = await Promise.all(
            units.map(async ({ unit, quantity }) => {
              if (populateTokens) return await populateToken(unit, { quantity })

              const tokenId = unit
              const tokenAmountOnChain = Number(quantity)
              let tokenAmountDecimals = 0

              const isFungible = tokenAmountOnChain > 1
              let tokenNameTicker = ''

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
                  onChain: '',
                  ticker: '',
                  display: '',
                },
              }

              if (isFungible) {
                token.tokenName.ticker = tokenNameTicker
              }

              return token
            })
          )

          wallet.handles.push(
            ...wallet.tokens
              .filter(({ tokenId }) => tokenId.indexOf(POLICY_IDS['ADA_HANDLE']) === 0)
              .map(({ tokenId }) => `$${fromHex(splitTokenId(tokenId, POLICY_IDS['ADA_HANDLE']).tokenName)}`)
          )
        }

        return res.status(200).json(wallet)
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error)

    if (error?.message === ERROR_TYPES['INVALID_WALLET_IDENTIFIER']) {
      return res.status(400).end('Please provide a valid wallet identifer: $handle / addr1... / stake1...')
    }

    if (
      [
        'The requested component has not been found.',
        'Invalid address for this network or malformed address format.',
        'Invalid or malformed stake address format.',
      ].includes(error?.message)
    ) {
      return res.status(404).end(`Wallet not found: ${walletId}`)
    }

    return res.status(500).end()
  }
}

export default handler
