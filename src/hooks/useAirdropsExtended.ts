import { useEffect } from 'react'
import { useAirdropStore } from '@/store'
import { formatTokenAmountFromChain, getTimeStampLabel } from '@/functions'
import type { Airdrop, AirdropMonth, AirdropRicipent, AirdropTransaction } from '@/@types'

interface UseAirdropsExtended {
  months: AirdropMonth[]
  transactions: AirdropTransaction[]
  recipients: AirdropRicipent[]
}

const mapAirdrops = (data: Airdrop[]) => {
  const monthMap = new Map<string, AirdropMonth>()
  const transactionMap = new Map<string, AirdropTransaction>()
  const recipientMap = new Map<string, AirdropRicipent>()

  for (const item of data) {
    const { label: monthLabel, startOfmonth } = getTimeStampLabel(item.timestamp)

    // Update AirdropMonth
    if (!monthMap.has(monthLabel)) {
      monthMap.set(monthLabel, {
        label: monthLabel,
        airdropCount: 1,
        timestamp: startOfmonth,
      })
    } else {
      monthMap.get(monthLabel)!.airdropCount++
    }

    for (const recipient of item.recipients || []) {
      const txKey = recipient.txHash

      // Update AirdropTransaction
      if (!transactionMap.has(txKey)) {
        transactionMap.set(txKey, {
          timestamp: item.timestamp,
          airdropId: item.id as string,
          txHash: recipient.txHash,
          recipientCount: 1,
          thumb: item.thumb,
          tokenId: item.tokenId,
          tokenName: item.tokenName,
          tokenAmount: { display: 0, onChain: 0, decimals: 0 },
        })
      } else {
        transactionMap.get(txKey)!.recipientCount++
      }

      const recipientKey = `${txKey}-${recipient.stakeKey}`

      // Update AirdropRicipent
      if (!recipientMap.has(recipientKey)) {
        recipientMap.set(recipientKey, {
          timestamp: item.timestamp,
          airdropId: item.id as string,
          stakeKey: recipient.stakeKey,
          thumb: item.thumb,
          txHash: recipient.txHash,
          tokenId: item.tokenId,
          tokenName: item.tokenName,
          tokenAmount: {
            display: formatTokenAmountFromChain(recipient.quantity, item.tokenAmount.decimals),
            onChain: recipient.quantity,
            decimals: item.tokenAmount.decimals,
          },
        })
      } else {
        const r = recipientMap.get(recipientKey)!
        r.tokenAmount.display += formatTokenAmountFromChain(recipient.quantity, item.tokenAmount.decimals)
        r.tokenAmount.onChain += recipient.quantity
      }
    }
  }

  return {
    m: Array.from(monthMap.values()).sort((a, b) => b.timestamp - a.timestamp),
    t: Array.from(transactionMap.values()).sort((a, b) => b.timestamp - a.timestamp),
    r: Array.from(recipientMap.values()).sort((a, b) => b.timestamp - a.timestamp),
  }
}

export const UseAirdropsExtended = (): UseAirdropsExtended => {
  const { airdrops, months, setMonths, transactions, setTransactions, recipients, setRecipients } = useAirdropStore()

  useEffect(() => {
    if (!!airdrops.length) {
      const { m, t, r } = mapAirdrops(airdrops)

      setMonths(m)
      setTransactions(t)
      setRecipients(r)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airdrops])

  return {
    months,
    transactions,
    recipients,
  }
}
