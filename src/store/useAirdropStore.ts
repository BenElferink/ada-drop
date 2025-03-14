import { create } from 'zustand'
import type { Airdrop, AirdropMonth, AirdropRicipent, AirdropTransaction } from '@/@types'

export interface IAirdropStore {
  airdrops: Airdrop[]
  setAirdrops: (airdrops: Airdrop[]) => void
  months: AirdropMonth[]
  setMonths: (months: AirdropMonth[]) => void
  transactions: AirdropTransaction[]
  setTransactions: (transactions: AirdropTransaction[]) => void
  recipients: AirdropRicipent[]
  setRecipients: (recipients: AirdropRicipent[]) => void
}

export const useAirdropStore = create<IAirdropStore>((set) => ({
  airdrops: [],
  setAirdrops: (airdrops) => set({ airdrops }),
  months: [],
  setMonths: (months) => set({ months }),
  transactions: [],
  setTransactions: (transactions) => set({ transactions }),
  recipients: [],
  setRecipients: (recipients) => set({ recipients }),
}))
