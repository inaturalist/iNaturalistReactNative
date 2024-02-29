// @flow

import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useCallback, useState } from "react";

const useDebugMode = ( ): { isDebug: boolean, toggleDebug: Function } => {
  const {
    getItem: fetchDebug,
    setItem: saveDebug
  } = useAsyncStorage( "debugMode" );
  const [isDebug, setDebug] = useState( false );

  fetchDebug( ).then( result => {
    setDebug( result === "true" );
  } );

  const toggleDebug = useCallback( ( ) => {
    saveDebug( ( !isDebug ).toString( ) );
    setDebug( !isDebug );
  }, [isDebug, saveDebug] );

  return {
    isDebug,
    toggleDebug
  };
};

export default useDebugMode;
