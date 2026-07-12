import { create } from 'zustand';
import type { Destination, Source } from '@odigos/ui-kit/types';

export type AvailableSource = Pick<Source, 'namespace' | 'name' | 'kind' | 'selected' | 'numberOfInstances'>;
export interface AvailableSourcesByNamespace {
  [namespace: string]: AvailableSource[];
}

export type SelectedSource = AvailableSource & { currentStreamName: string };
export interface SourceSelectionFormData {
  [namespace: string]: SelectedSource[];
}

export type SelectedNamespace = { namespace: string; selected: boolean; currentStreamName: string };
export interface NamespaceSelectionFormData {
  [namespace: string]: SelectedNamespace;
}

export interface ISetupState {
  // in onboarding this is used to keep state of sources that are available for selection in a namespace, in-case user goes back a page (from destinations to sources)
  availableSources: AvailableSourcesByNamespace;
  // in onboarding this is used to keep state of added sources
  configuredSources: SourceSelectionFormData;
  // in onboarding this is used to keep state of namespaces with future-apps selected
  configuredFutureApps: NamespaceSelectionFormData;
  // in onbaording this is used to keep state of added destinations (which will then be created)
  configuredDestinations: Destination[];
  // in onbaording this is used to keep state of added already-configured destinations (which will then be updated)
  configuredDestinationsUpdateOnly: Destination[];
}

interface ISetupStateSetters {
  setAvailableSources: (payload: ISetupState['availableSources']) => void;
  setConfiguredSources: (payload: ISetupState['configuredSources']) => void;
  setConfiguredFutureApps: (payload: ISetupState['configuredFutureApps']) => void;

  setConfiguredDestinations: (payload: ISetupState['configuredDestinations']) => void;
  addConfiguredDestination: (payload: Destination) => void;
  removeConfiguredDestination: (payload: Destination) => void;

  setConfiguredDestinationsUpdateOnly: (payload: ISetupState['configuredDestinationsUpdateOnly']) => void;
  addConfiguredDestinationUpdateOnly: (payload: Destination) => void;
  removeConfiguredDestinationUpdateOnly: (payload: Destination) => void;

  resetState: () => void;
}

const initialState: ISetupState = {
  availableSources: {},
  configuredSources: {},
  configuredFutureApps: {},
  configuredDestinations: [],
  configuredDestinationsUpdateOnly: [],
};

const filterByType = (existingDest: Destination, compareDest: Destination) => existingDest.destinationType.type !== compareDest.destinationType.type;

export const useSetupStore = create<ISetupState & ISetupStateSetters>((set) => ({
  ...initialState,

  setAvailableSources: (payload) => set({ availableSources: payload }),
  setConfiguredSources: (payload) => set({ configuredSources: payload }),
  setConfiguredFutureApps: (payload) => set({ configuredFutureApps: payload }),

  setConfiguredDestinations: (payload) => set({ configuredDestinations: payload }),
  addConfiguredDestination: (payload) => set((state) => ({ configuredDestinations: [...state.configuredDestinations, payload] })),
  removeConfiguredDestination: (payload) => set((state) => ({ configuredDestinations: state.configuredDestinations.filter((dest) => filterByType(dest, payload)) })),

  setConfiguredDestinationsUpdateOnly: (payload) => set({ configuredDestinationsUpdateOnly: payload }),
  addConfiguredDestinationUpdateOnly: (payload) =>
    set((state) => {
      // For update-only cases, we have to prevent duplicates using the dest ID
      const merged = [...state.configuredDestinationsUpdateOnly, payload];
      const mapped: [string, Destination][] = merged.map((d) => [d.id, d]);
      const uniqueById = Array.from(new Map(mapped).values());
      return { configuredDestinationsUpdateOnly: uniqueById };
    }),
  removeConfiguredDestinationUpdateOnly: (payload) => set((state) => ({ configuredDestinationsUpdateOnly: state.configuredDestinationsUpdateOnly.filter((dest) => filterByType(dest, payload)) })),

  resetState: () => set(() => ({ ...initialState })),
}));
