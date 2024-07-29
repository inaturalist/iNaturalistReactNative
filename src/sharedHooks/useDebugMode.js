// @flow

import { useCallback, useEffect, useState } from "react";
import { zustandStorage } from "stores/useStore";

const useDebugMode = ( ): { isDebug: boolean, toggleDebug: Function } => {
  const [isDebug, setDebug] = useState( false );

  useEffect( ( ) => {
    const readDebugModeFromStorage = ( ) => {
      const storedDebugMode = zustandStorage.getItem( "debugMode" );
      console.log( storedDebugMode, "stored debug mode" );
      setDebug( storedDebugMode === "true" );
    };

    readDebugModeFromStorage( );
  }, [] );

  const toggleDebug = useCallback( ( ) => {
    zustandStorage.setItem( "debugMode", ( !isDebug ).toString( ) );
    setDebug( !isDebug );
  }, [isDebug] );

  return {
    isDebug,
    toggleDebug
  };
};

export default useDebugMode;
