import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

import createExploreSlice from "./createExploreSlice";
import createLayoutSlice from "./createLayoutSlice";
import createObservationFlowSlice from "./createObservationFlowSlice";

const storage = new MMKV();

const zustandStorage: StateStorage = {
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
  ( ...a ) => ( {
    ...createExploreSlice( ...a ),
    ...createObservationFlowSlice( ...a ),
    ...createLayoutSlice( ...a )
  } ),
  {
    name: "persisted-zustand",
    partialize: state => ( {
      isAdvancedUser: state.isAdvancedUser,
      currentTabId: state.currentTabId
    } ),
    storage: createJSONStorage( () => zustandStorage )
  }
) );

export default useStore;
