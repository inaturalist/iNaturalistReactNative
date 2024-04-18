// @flow
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const useStoredLayout = ( storageKey: string ): any => {
  const {
    getItem: getStoredLayout,
    setItem: setStoredLayout
  } = useAsyncStorage( storageKey );
  const [layout, setLayout] = useState( null );

  const writeLayoutToStorage = useCallback( async newValue => {
    await setStoredLayout( newValue );
    setLayout( newValue );
  }, [setStoredLayout] );

  useEffect( ( ) => {
    const readLayoutFromStorage = async ( ) => {
      const storedLayout = await getStoredLayout( );
      const defaultLayout = storageKey === "exploreObservationsLayout"
        ? "map"
        : "list";
      setLayout( storedLayout || defaultLayout );
    };

    readLayoutFromStorage( );
  }, [getStoredLayout, writeLayoutToStorage, storageKey] );

  return {
    layout,
    writeLayoutToStorage
  };
};

export default useStoredLayout;
