// @flow
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const useStoredLayout = ( storageKey: string ): Object => {
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
      setLayout( storedLayout || "list" );
    };

    readLayoutFromStorage( );
  }, [getStoredLayout, writeLayoutToStorage] );

  return {
    layout,
    writeLayoutToStorage
  };
};

export default useStoredLayout;
