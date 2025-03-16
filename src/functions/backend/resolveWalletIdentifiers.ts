import * as cardanoSerialization from '@emurgo/cardano-serialization-lib-nodejs'
import { ERROR_TYPES } from '@/constants'
import adaHandle from '@/utils/ada-handle'
import blockfrost from '@/utils/blockfrost'
import type { Address, StakeKey } from '@/@types'

const resolveWalletIdentifiers = async (
  walletIdentifier: string
): Promise<{
  stakeKey: StakeKey
  addresses: Address['address'][]
}> => {
  let stakeKey = walletIdentifier.indexOf('stake1') === 0 ? walletIdentifier : ''
  let walletAddress = walletIdentifier.indexOf('addr1') === 0 ? walletIdentifier : ''
  const handle = walletIdentifier.indexOf('$') === 0 ? walletIdentifier : ''

  if (!stakeKey && !walletAddress && !handle) {
    let stringFromCbor = ''

    try {
      stringFromCbor = cardanoSerialization.Address.from_bytes(
        walletIdentifier.length % 2 === 0 && /^[0-9A-F]*$/i.test(walletIdentifier)
          ? Buffer.from(walletIdentifier, 'hex')
          : Buffer.from(walletIdentifier, 'utf-8')
      ).to_bech32()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {}

    stakeKey = stringFromCbor.indexOf('stake1') === 0 ? stringFromCbor : ''
    walletAddress = stringFromCbor.indexOf('addr1') === 0 ? stringFromCbor : ''

    if (!stakeKey && !walletAddress) throw new Error(ERROR_TYPES['INVALID_WALLET_IDENTIFIER'])
  }

  if (!stakeKey) {
    if (!walletAddress) {
      walletAddress = (await adaHandle.resolveHolderFromHandle(handle)).address

      if (!walletAddress) throw new Error(ERROR_TYPES['INVALID_WALLET_IDENTIFIER'])
    }

    const { stake_address } = await blockfrost.addresses(walletAddress)
    stakeKey = stake_address || ''
  }

  const addresses = stakeKey ? (await blockfrost.accountsAddressesAll(stakeKey)).map((obj) => obj.address) : [walletAddress]

  return {
    stakeKey,
    addresses,
  }
}

export default resolveWalletIdentifiers
