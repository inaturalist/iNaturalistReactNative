import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
import { selectCanRollbackToMatch } from "stores/createObservationFlowSlice";
import useStore from "stores/useStore";

interface ObsEditRollbackParams {
  [name: string]: {
    lastScreen?: string;
  };
}

function useObsEditRollback( ): { rollback: ( ) => void; canRollbackToMatch: boolean } {
  const { params } = useRoute<RouteProp<ObsEditRollbackParams, string>>( );
  const hasSnapshot = useStore( state => state.rollbackSnapshot !== null );
  const setRollbackSnapshot = useStore( state => state.setRollbackSnapshot );
  const restoreRollbackSnapshot = useStore( state => state.restoreRollbackSnapshot );
  const canRollbackToMatch = useStore( selectCanRollbackToMatch );

  useEffect( ( ) => {
    if ( !hasSnapshot && params?.lastScreen === "Match" ) {
      setRollbackSnapshot( );
    }
  }, [
    params?.lastScreen,
    hasSnapshot,
    setRollbackSnapshot,
  ] );

  const rollback = useCallback( ( ) => {
    restoreRollbackSnapshot( );
  }, [restoreRollbackSnapshot] );

  return { rollback, canRollbackToMatch };
}

export default useObsEditRollback;
