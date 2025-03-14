import { create } from 'zustand'
import type { Airdrop } from '@/@types'

export interface IAirdropStore {
  airdrops: Airdrop[]
  setAirdrops: (airdrops: Airdrop[]) => void
}

export const useAirdropStore = create<IAirdropStore>((set) => ({
  airdrops: [],
  setAirdrops: (airdrops) => set({ airdrops }),
}))
