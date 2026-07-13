import { create } from 'zustand';
import { EntityTypes, type WorkloadId } from '@odigos/ui-kit/types';

export interface DrawerStoreState {
  // Define the drawer type
  drawerType: EntityTypes | null;
  // If the drawer type is of EntityTypes, then the "id" should be defined too
  drawerEntityId: string | WorkloadId | null;
}

interface DrawerStoreStateSetters {
  setDrawerType: (value: DrawerStoreState['drawerType']) => void;
  setDrawerEntityId: (value: DrawerStoreState['drawerEntityId']) => void;
}

export const useDrawerStore = create<DrawerStoreState & DrawerStoreStateSetters>((set) => ({
  drawerType: null,
  drawerEntityId: null,
  setDrawerType: (value) => set({ drawerType: value }),
  setDrawerEntityId: (value) => set({ drawerEntityId: value }),
}));
