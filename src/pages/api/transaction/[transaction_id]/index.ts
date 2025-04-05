import type { NextApiRequest, NextApiResponse } from 'next'
import blockfrost from '@/utils/blockfrost'
import type { Transaction, Utxo } from '@/@types'

export const config = {
  maxDuration: 300,
  api: {
    responseLimit: false,
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse<Transaction>) => {
  const { method, query } = req

  const transactionId = query.transaction_id?.toString()
  const withUtxos = !!query.with_utxos && query.with_utxos == 'true'

  if (!transactionId) return res.status(400).end()

  try {
    switch (method) {
      case 'GET': {
        const tx = await blockfrost.txs(transactionId)

        const payload: Transaction = {
          transactionId,
          block: tx.block,
          blockHeight: tx.block_height,
        }

        if (withUtxos) {
          const txUtxos = await blockfrost.txsUtxos(transactionId)
          const utxos: Utxo[] = []

          for (const input of txUtxos.inputs) {
            const fromAddress = input.address

            for (const output of txUtxos.outputs) {
              const toAddress = output.address

              if (toAddress !== fromAddress) {
                const tokens: Utxo['tokens'] = []

                output.amount.forEach(({ unit, quantity }) => {
                  if (unit !== 'lovelace' && !!input.amount.find((inp) => inp.unit === unit)) {
                    tokens.push({
                      tokenId: unit,
                      tokenAmount: {
                        onChain: Number(quantity),
                      },
                    })
                  }
                })

                if (tokens.length) {
                  utxos.push({
                    address: {
                      from: fromAddress,
                      to: toAddress,
                    },
                    tokens,
                  })
                }
              }
            }
          }

          payload.utxos = utxos
        }

        return res.status(200).json(payload)
      }

      default: {
        res.setHeader('Allow', 'GET')
        return res.status(405).end()
      }
    }
  } catch (error: any) {
    console.error(error)

    if (['The requested component has not been found.'].includes(error?.message)) {
      return res.status(404).end(`${error.message} ${transactionId}`)
    }

    return res.status(500).end()
  }
}

export default handler
