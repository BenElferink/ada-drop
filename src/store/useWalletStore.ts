import { create } from 'zustand'
import type { PopulatedToken } from '@/@types'

export interface IWalletStore {
  tokens: PopulatedToken[]
  setTokens: (tokens: PopulatedToken[]) => void
}

export const useWalletStore = create<IWalletStore>((set) => ({
  tokens: [],
  setTokens: (tokens) => set({ tokens }),
}))
