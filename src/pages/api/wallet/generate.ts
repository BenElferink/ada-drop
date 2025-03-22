import type { NextApiRequest, NextApiResponse } from 'next'
import type { Address } from '@/@types'
import { BLOCKFROST_API_KEY } from '@/constants'
import { AppWallet, BlockfrostProvider } from '@meshsdk/core'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

export interface WalletGenerateResponse {
  address: Address['address']
  mnemonic: string[]
}

const handler = async (req: NextApiRequest, res: NextApiResponse<WalletGenerateResponse>) => {
  const { method } = req

  try {
    switch (method) {
      case 'GET': {
        const mnemonic = AppWallet.brew()

        const provider = new BlockfrostProvider(BLOCKFROST_API_KEY)
        const wallet = new AppWallet({
          networkId: 1,
          fetcher: provider,
          submitter: provider,
          key: {
            type: 'mnemonic',
            words: mnemonic,
          },
        })

        const address = wallet.getPaymentAddress()

        return res.status(200).json({
          address,
          mnemonic,
        })
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error) {
    console.error(error)
    return res.status(500).end()
  }
}

export default handler
