import { ADA, WALLETS } from '@/constants'
import { type IWallet, Transaction } from '@meshsdk/core'
import { formatTokenAmountToChain, txConfirmation } from '@/functions'
import type { PayoutProgressCounts, PayoutRecipient, TokenId } from '@/@types'

export const batchTxs = async (
  difference: number,
  wallet: IWallet,
  tokenId: TokenId,
  devFee: number,
  recipients: PayoutRecipient[],
  recipientsCallback: (payload: PayoutRecipient[]) => void,
  progressCallback?: (msg: string, payload: PayoutProgressCounts) => void
): Promise<PayoutRecipient[]> => {
  const unpayedWallets = recipients.filter(({ txHash }) => !txHash)
  const devWallet = recipients.find(({ isDev }) => isDev)
  if (!devWallet) {
    unpayedWallets.unshift({
      stakeKey: WALLETS['STAKE_KEYS']['DEV'],
      address: WALLETS['ADDRESSES']['DEV'],
      payout: devFee,
      isDev: true,
    })
  }

  const batchSize = difference ? Math.floor(difference * unpayedWallets.length) : unpayedWallets.length
  const batches: PayoutRecipient[][] = []

  for (let i = 0; i < unpayedWallets.length; i += batchSize) {
    batches.push(unpayedWallets.slice(i, (i / batchSize + 1) * batchSize))
  }

  progressCallback?.('Batching transactions...', { batch: { current: 0, max: batches.length } })

  try {
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      const tx = new Transaction({ initiator: wallet })

      for (const { address, payout, isDev } of batch) {
        if (tokenId === 'lovelace' || isDev) {
          const minLovelaces = formatTokenAmountToChain(1, ADA['DECIMALS'])

          if (payout > minLovelaces) {
            tx.sendLovelace({ address }, String(payout))
          } else {
            // !! skip because the user did not approve adding this amount
          }
        } else {
          tx.sendAssets({ address }, [
            {
              unit: tokenId,
              quantity: String(payout),
            },
          ])
        }
      }

      progressCallback?.(`Building transaction ${i + 1}/${batches.length}`, { batch: { current: i, max: batches.length } })

      // this may throw an error if TX size is over the limit
      const unsignedTx = await tx.build()
      const signedTx = await wallet.signTx(unsignedTx)
      const txHash = await wallet.submitTx(signedTx)

      progressCallback?.('Awaiting network confirmation', { batch: { current: i, max: batches.length } })
      await txConfirmation(txHash)
      progressCallback?.('', { batch: { current: i + 1, max: batches.length } })

      recipients = recipients.map((r) => ({
        ...r,
        txHash: !!batch.find((b) => b.stakeKey === r.stakeKey) ? txHash : r.txHash,
      }))
      recipientsCallback(recipients)
    }

    return recipients

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const errMsg = error?.response?.data || error?.message || error?.toString() || 'UNKNOWN ERROR'

    if (!!errMsg && errMsg.indexOf('Maximum transaction size') !== -1) {
      // errMsg === `txBuildResult error: JsValue("Maximum transaction size of 16384 exceeded. Found: 19226")`
      const splitMessage: string[] = errMsg.split(' ')
      const [maxMem, currMem] = splitMessage.map((str) => Number(str.replace(/[^\d]/g, ''))).filter((num) => num && !isNaN(num))
      const newDifference = (difference || 1) * (maxMem / currMem)

      console.log('Trying Batch Size', newDifference)
      return await batchTxs(newDifference, wallet, tokenId, devFee, recipients, recipientsCallback, progressCallback)
    } else {
      console.error('Error batching TXs:\n', `${errMsg}\n`, error)
      throw new Error(errMsg)
    }
  }
}
