import axios from 'axios'
import type { Address, StakeKey } from '@/@types'

interface FetchedHandle {
  hex: string
  name: string
  image: string // ipfs
  standard_image: string // ipfs
  holder: StakeKey | Address['address']
  length: number
  og_number: number
  rarity: string
  utxo: string
  characters: string
  numeric_modifiers: string
  default_in_wallet: string
  pfp_image: string // ipfs
  pfp_asset: string
  bg_image: string // ipfs
  bg_asset: string
  resolved_addresses?: {
    ada: Address['address']
  }
  created_slot_number: number
  updated_slot_number: number
  has_datum: boolean
  svg_version: string
  image_hash: string
  standard_image_hash: string
}

interface FetchedHolder {
  total_handles: number
  default_handle: string
  manually_set: boolean
  address: StakeKey
  known_owner_name: string
  type: string
}

class AdaHandle {
  baseUrl: string

  constructor() {
    this.baseUrl = 'https://api.handle.me'
  }

  resolveHolderFromHandle = (
    handle: string
  ): Promise<{
    handle: string
    holder: StakeKey | Address['address']
    address: Address['address']
  }> => {
    const uri = `${this.baseUrl}/handles/${handle.replace('$', '')}`

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get<FetchedHandle>(uri, {
          headers: {
            'Accept-Encoding': 'application/json',
          },
        })

        const payload = {
          handle,
          holder: data.holder,
          address: data.resolved_addresses?.ada || '',
        }

        return resolve(payload)
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return resolve({
            handle,
            holder: '',
            address: '',
          })
        }

        return reject(error)
      }
    })
  }

  resolveHandleFromHolder = (stakeKey: StakeKey): Promise<string> => {
    const uri = `${this.baseUrl}/holders/${stakeKey}`

    return new Promise(async (resolve, reject) => {
      try {
        const { data } = await axios.get<FetchedHolder>(uri, {
          headers: {
            'Accept-Encoding': 'application/json',
          },
        })

        let handle = data.default_handle || ''

        if (handle) {
          const { holder } = await this.resolveHolderFromHandle(handle)

          if (holder !== stakeKey) {
            console.warn('Resolved with incorrect wallet handle:', handle)
            return resolve('')
          }

          handle = `$${handle}`
        }

        return resolve(handle)
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return resolve('')
        }

        return reject(error)
      }
    })
  }
}

const adaHandle = new AdaHandle()

export default adaHandle
