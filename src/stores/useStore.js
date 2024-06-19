import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import createExploreSlice from "./createExploreSlice";
import createLayoutSlice from "./createLayoutSlice";
import createObservationFlowSlice from "./createObservationFlowSlice";
import createSyncObservationsSlice from "./createSyncObservationsSlice";
import createUploadObservationsSlice from "./createUploadObservationsSlice";

const storage = new MMKV();

const zustandStorage = {
  setItem: ( name, value ) => storage.set( name, value ),
  getItem: name => {
    const value = storage.getString( name );
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
      createSyncObservationsSlice( ...args ),
      createExploreSlice( ...args ),
      createObservationFlowSlice( ...args ),
      createLayoutSlice( ...args ),
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
      isAdvancedUser: state.isAdvancedUser
    } ),
    storage: createJSONStorage( () => zustandStorage )
  }
) );

export default useStore;
