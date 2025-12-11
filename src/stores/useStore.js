import _ from "lodash";
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import createExploreSlice from "./createExploreSlice";
import createFirebaseTraceSlice from "./createFirebaseTraceSlice";
import createLayoutSlice from "./createLayoutSlice";
import createMyObsSlice from "./createMyObsSlice";
import createObservationFlowSlice from "./createObservationFlowSlice";
import createRootExploreSlice from "./createRootExploreSlice";
import createSyncObservationsSlice from "./createSyncObservationsSlice";
import createUploadObservationsSlice from "./createUploadObservationsSlice";

export const storage = new MMKV( );

// TODO do *not* export this. This allows any consumer to overwrite *any* part
// of state, circumventing any getter/setter logic we have in the stores. If
// you need to modify state, you should be doing so through a store.
export const zustandStorage = {
  setItem: ( name, value ) => storage.set( name, value ),
  getItem: name => {
    const value = storage.getString( name ) || storage.getNumber( name );
    return value ?? null;
  },
  removeItem: name => storage.delete( name )
};

// Using slices to separate store for Explore and Observation creation flow
// https://docs.pmnd.rs/zustand/guides/slices-pattern
const useStore = create( persist(
  ( ...args ) => {
    // Let's make our slices
    const slices = [
      createExploreSlice( ...args ),
      createFirebaseTraceSlice( ...args ),
      createLayoutSlice( ...args ),
      createMyObsSlice( ...args ),
      createObservationFlowSlice( ...args ),
      createRootExploreSlice( ...args ),
      createSyncObservationsSlice( ...args ),
      createUploadObservationsSlice( ...args )
    ];

    // Now let's make sure they're not clobbering each other because
    // everything in Zustand state exists in a single namespace and
    // clobbering can happen silently... which is bad.
    const allKeys = slices.map( slice => Object.keys( slice ) ).flat( );
    const keyCounts = allKeys.reduce(
      ( memo, curr ) => {
        memo[curr] ||= 0;
        memo[curr] += 1;
        return memo;
      },
      {}
    );
    const nonUniqueKeys = Object.keys( keyCounts ).reduce(
      ( memo, curr ) => {
        if ( keyCounts[curr] > 1 ) memo.push( curr );
        return memo;
      },
      []
    );
    if ( nonUniqueKeys.length > 0 ) {
      throw new Error(
        `You have multiple Zustand slices with the following keys: ${nonUniqueKeys}`
      );
    }

    // All good? Now let's combine them into one enormous hideous object
    return slices.reduce(
      ( memo, curr ) => ( { ...memo, ...curr } ),
      {}
    );
  },
  {
    name: "persisted-zustand",
    partialize: state => ( {
      // Vestigial un-namespaced values in the layout slice
      isAdvancedUser: state.isAdvancedUser,
      obsDetailsTab: state.obsDetailsTab,

      // Dynamically select all values in the layout slice's namespace
      layout: ( Object.keys( state.layout ).reduce( ( memo, key ) => {
        if ( typeof ( state.layout[key] ) !== "function" ) {
          memo[key] = state.layout[key];
        }
        return memo;
      }, {} ) )
    } ),
    storage: createJSONStorage( () => zustandStorage ),
    // We need to deep merge to persist nested objects, like layout
    // https://zustand.docs.pmnd.rs/middlewares/persist#persisting-a-state-with-nested-objects
    merge: ( persisted, current ) => _.merge( current, persisted )
  }
) );

export default useStore;
