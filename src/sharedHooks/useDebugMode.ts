import { useCallback, useEffect, useState } from "react";
import { zustandStorage } from "stores/useStore";

const DEBUG_MODE = "debugMode";

const useDebugMode = ( ): { isDebug: boolean, toggleDebug: () => void } => {
  const [isDebug, setDebug] = useState( false );

  useEffect( ( ) => {
    const readDebugModeFromStorage = ( ) => {
      const storedDebugMode = zustandStorage.getItem( DEBUG_MODE );
      setDebug( storedDebugMode === "true" );
    };

    readDebugModeFromStorage( );
  }, [] );

  const toggleDebug = useCallback( ( ) => {
    zustandStorage.setItem( DEBUG_MODE, ( !isDebug ).toString( ) );
    setDebug( !isDebug );
  }, [isDebug] );

  return {
    isDebug,
    toggleDebug
  };
};

export function isDebugMode( ): boolean {
  return zustandStorage.getItem( DEBUG_MODE ) === "true";
}

export default useDebugMode;
