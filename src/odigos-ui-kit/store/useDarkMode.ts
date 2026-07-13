import { create } from 'zustand';
import { STORAGE_KEYS } from '@odigos/ui-kit/constants';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface DarkModeState {
  darkMode: boolean;
}

export interface DarkModeStateSetters {
  setDarkMode: (bool: boolean) => void;
}

export const useDarkMode = create<DarkModeState & DarkModeStateSetters>()(
  persist(
    (set) => ({
      darkMode: true,
      setDarkMode: (bool) => set({ darkMode: bool }),
    }),
    {
      name: STORAGE_KEYS.DARK_MODE,
      storage: typeof window !== 'undefined' ? createJSONStorage(() => localStorage) : undefined,
    },
  ),
);
