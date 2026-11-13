import { useCallback, useEffect, useState } from "react";
import { zustandStorage } from "stores/useStore";

interface LayoutHook {
  layout: string | null;
  writeLayoutToStorage: ( newValue: string ) => void;
}

// Keeps its pre-rename value so users' saved Explore layout survives
export const EXPLORE_LAYOUT_STORAGE_KEY = "exploreV2ObservationsLayout";

const MAP_DEFAULT_STORAGE_KEYS = [EXPLORE_LAYOUT_STORAGE_KEY];

const useStoredLayout = ( storageKey: string ): LayoutHook => {
  const [layout, setLayout] = useState<string | null>( null );

  const writeLayoutToStorage = useCallback( ( newValue: string ) => {
    zustandStorage.setItem( storageKey, newValue );
    setLayout( newValue );
  }, [storageKey] );

  useEffect( ( ) => {
    const readLayoutFromStorage = async ( ) => {
      // Casting is necessary because zustandStorage.getItem returns string | number | null
      const storedLayout = zustandStorage.getItem( storageKey ) as string | null;
      const defaultLayout = MAP_DEFAULT_STORAGE_KEYS.includes( storageKey )
        ? "map"
        : "grid";
      setLayout( storedLayout || defaultLayout );
    };

    readLayoutFromStorage( );
  }, [writeLayoutToStorage, storageKey] );

  return {
    layout,
    writeLayoutToStorage,
  };
};

export default useStoredLayout;
