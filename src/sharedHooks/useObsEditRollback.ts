import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import useStore from "stores/useStore";

interface ObsEditRollbackParams {
  [name: string]: {
    lastScreen?: string;
  };
}

function useObsEditRollback( ): { rollback: ( ) => void; isFromMatch: boolean } {
  const { params } = useRoute<RouteProp<ObsEditRollbackParams, string>>( );
  const rollbackSnapshot = useStore( state => state.rollbackSnapshot );
  const setRollbackSnapshot = useStore( state => state.setRollbackSnapshot );
  const restoreRollbackSnapshot = useStore( state => state.restoreRollbackSnapshot );

  useEffect( ( ) => {
    if ( rollbackSnapshot === null && params?.lastScreen === "Match" ) {
      setRollbackSnapshot( );
    }
  }, [
    params?.lastScreen,
    rollbackSnapshot,
    setRollbackSnapshot,
  ] );

  const rollback = useCallback( ( ) => {
    if ( rollbackSnapshot ) {
      restoreRollbackSnapshot( rollbackSnapshot );
    }
  }, [restoreRollbackSnapshot, rollbackSnapshot] );

  const isFromMatch = rollbackSnapshot !== null;

  return { rollback, isFromMatch };
}

export default useObsEditRollback;
