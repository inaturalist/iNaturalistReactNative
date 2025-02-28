// @flow
import { useCallback, useEffect, useState } from "react";
import { zustandStorage } from "stores/useStore";

const useStoredLayout = ( storageKey: string ): Object => {
  const [layout, setLayout] = useState( null );

  const writeLayoutToStorage = useCallback( newValue => {
    zustandStorage.setItem( storageKey, newValue );
    setLayout( newValue );
  }, [storageKey] );

  useEffect( ( ) => {
    const readLayoutFromStorage = async ( ) => {
      const storedLayout = zustandStorage.getItem( storageKey );
      const defaultLayout = storageKey === "exploreObservationsLayout"
        ? "map"
        : "grid";
      setLayout( storedLayout || defaultLayout );
    };

    readLayoutFromStorage( );
  }, [writeLayoutToStorage, storageKey] );

  return {
    layout,
    writeLayoutToStorage
  };
};

export default useStoredLayout;
