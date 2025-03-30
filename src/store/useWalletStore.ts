import { create } from 'zustand'
import type { PopulatedToken } from '@/@types'
import { deepClone } from '@odigos/ui-kit/functions'

export interface IWalletStore {
  tokens: PopulatedToken[]
  setTokens: (tokens: PopulatedToken[]) => void
  addTokens: (tokens: PopulatedToken[]) => void
}

export const useWalletStore = create<IWalletStore>((set) => ({
  tokens: [],
  setTokens: (tokens) => set({ tokens }),
  addTokens: (tokens) =>
    set((state) => {
      const prev = deepClone(state.tokens)

      tokens.forEach((newItem) => {
        const foundIdx = prev.findIndex((oldItem) => oldItem.tokenId === newItem.tokenId)

        if (foundIdx !== -1) {
          prev[foundIdx] = { ...prev[foundIdx], ...newItem }
        } else if (newItem.tokenId === 'lovelace') {
          prev.unshift(newItem)
        } else {
          prev.push(newItem)
        }
      })

      return { tokens: prev }
    }),
}))
