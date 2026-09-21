import merge from "lodash/merge";
import { create } from "zustand";
import type { StateStorage } from "zustand/middleware";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ExploreSlice } from "./createExploreSlice";
import createExploreSlice from "./createExploreSlice";
import type { ExploreV2AdvancedSearchSlice } from "./createExploreV2AdvancedSearchSlice";
import createExploreV2AdvancedSearchSlice from "./createExploreV2AdvancedSearchSlice";
import type { ExploreV2SearchesSlice } from "./createExploreV2SearchesSlice";
import createExploreV2SearchesSlice from "./createExploreV2SearchesSlice";
import type { FeatureFlagSlice } from "./createFeatureFlagSlice";
import createFeatureFlagSlice from "./createFeatureFlagSlice";
import type { FirebaseTraceSlice } from "./createFirebaseTraceSlice";
import createFirebaseTraceSlice from "./createFirebaseTraceSlice";
import type { LayoutSlice } from "./createLayoutSlice";
import createLayoutSlice from "./createLayoutSlice";
import type { MyObservationsSlice } from "./createMyObservationsSlice";
import createMyObservationsSlice from "./createMyObservationsSlice";
import type { ObservationFlowSlice } from "./createObservationFlowSlice";
import createObservationFlowSlice from "./createObservationFlowSlice";
import type { RootExploreSlice } from "./createRootExploreSlice";
import createRootExploreSlice from "./createRootExploreSlice";
import type { SyncObservationsSlice } from "./createSyncObservationsSlice";
import createSyncObservationsSlice from "./createSyncObservationsSlice";
import type { UploadObservationsSlice } from "./createUploadObservationsSlice";
import createUploadObservationsSlice from "./createUploadObservationsSlice";
import storage from "./zustandMMKVBackingStorage";

type StoreState =
  ExploreSlice
  & ExploreV2AdvancedSearchSlice
  & ExploreV2SearchesSlice
  & FeatureFlagSlice
  & FirebaseTraceSlice
  & LayoutSlice
  & MyObservationsSlice
  & ObservationFlowSlice
  & RootExploreSlice
  & SyncObservationsSlice
  & UploadObservationsSlice;

// TODO do *not* export this. This allows any consumer to overwrite *any* part
// of state, circumventing any getter/setter logic we have in the stores. If
// you need to modify state, you should be doing so through a store.
export const zustandStorage = {
  setItem: ( name: string, value: string | number ) => storage.set( name, value ),
  getItem: ( name: string ) => {
    const value = storage.getString( name ) || storage.getNumber( name );
    return value ?? null;
  },
  removeItem: ( name: string ) => storage.delete( name ),
};

// Using slices to separate store for Explore and Observation creation flow
// https://docs.pmnd.rs/zustand/guides/slices-pattern
const useStore = create<StoreState>()( persist(
  ( ...args ) => {
    // Let's make our slices
    const slices = [
      createExploreV2SearchesSlice( ...args ),
      createExploreSlice( ...args ),
      createExploreV2AdvancedSearchSlice( ...args ),
      createFeatureFlagSlice( ...args ),
      createFirebaseTraceSlice( ...args ),
      createLayoutSlice( ...args ),
      createMyObservationsSlice( ...args ),
      createObservationFlowSlice( ...args ),
      createRootExploreSlice( ...args ),
      createSyncObservationsSlice( ...args ),
      createUploadObservationsSlice( ...args ),
    ];

    // Now let's make sure they're not clobbering each other because
    // everything in Zustand state exists in a single namespace and
    // clobbering can happen silently... which is bad.
    const allKeys = slices.map( slice => Object.keys( slice ) ).flat( );
    const keyCounts = allKeys.reduce(
      ( memo: Record<string, number>, curr ) => {
        memo[curr] ||= 0;
        memo[curr] += 1;
        return memo;
      },
      {},
    );
    const nonUniqueKeys = Object.keys( keyCounts ).reduce(
      ( memo: string[], curr ) => {
        if ( keyCounts[curr] > 1 ) memo.push( curr );
        return memo;
      },
      [],
    );
    if ( nonUniqueKeys.length > 0 ) {
      throw new Error(
        `You have multiple Zustand slices with the following keys: ${nonUniqueKeys}`,
      );
    }

    // All good? Now let's combine them into one enormous hideous object
    return slices.reduce(
      ( memo, curr ) => ( { ...memo, ...curr } ),
      {},
    ) as StoreState;
  },
  {
    name: "persisted-zustand",
    partialize: state => ( {
      // Vestigial un-namespaced values in the layout slice
      isAdvancedUser: state.isAdvancedUser,
      obsDetailsTab: state.obsDetailsTab,

      // Dynamically select all values in the layout slice's namespace
      layout: ( ( Object.keys( state.layout ) as ( keyof LayoutSlice["layout"] )[] ).reduce(
        ( memo: Record<string, unknown>, key ) => {
          if ( typeof ( state.layout[key] ) !== "function" ) {
            memo[key] = state.layout[key];
          }
          return memo;
        },
        {},
      ) ),

      exploreRecentSearches: {
        subjects: state.exploreRecentSearches.subjects,
        places: state.exploreRecentSearches.places,
      },

      exploreSavedSearches: {
        searches: state.exploreSavedSearches.searches,
      },
    } ),
    // zustandStorage's getItem actually returns string | number | null instead of zustand's
    // expected string | null. There are some keys in this store (at least `numOfUserObservations`)
    // which are now fully managed _outside_ of zustand which used to be a mix of both.
    // Fixing this situation is tracked in MOB-1372.
    // Casting this here allows for getting most of the useStore typing benefit w/o fixing that
    // functional change just yet.
    storage: createJSONStorage( () => zustandStorage as unknown as StateStorage ),
    // We need to deep merge to persist nested objects, like layout
    // https://zustand.docs.pmnd.rs/middlewares/persist#persisting-a-state-with-nested-objects
    merge: ( persisted, current ) => merge( current, persisted ),
  },
) );

export default useStore;
