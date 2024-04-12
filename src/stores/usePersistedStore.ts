import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

const storage = new MMKV();

const zustandStorage: StateStorage = {
  setItem: ( name, value ) => storage.set( name, value ),
  getItem: name => {
    const value = storage.getString( name );
    return value ?? null;
  },
  removeItem: name => storage.delete( name )
};

const usePersistedStore = create(
  persist(
    ( set ) => ( {
      isAdvancedUser: false,
      setIsAdvancedUser: ( newValue ) => set( { isAdvancedUser: newValue } )
    } ),
    {
      name: "layout-storage",
      storage: createJSONStorage(() => zustandStorage)
    }
  )
);

export default usePersistedStore;
