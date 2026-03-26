import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { SharedStackParamList } from "navigation/types";
import { useCallback, useEffect, useRef } from "react";
import {
  backupObservationPhotos,
  restoreObservationPhotos,
} from "sharedHelpers/rollbackPhotos";
import { selectCanRollbackToMatch } from "stores/createObservationFlowSlice";
import useStore from "stores/useStore";

interface ObsEditRollbackReturn {
  rollback: ( ) => Promise<void>;
  canRollbackToMatch: boolean;
}

function useObsEditRollback( ): ObsEditRollbackReturn {
  const { params } = useRoute<RouteProp<SharedStackParamList, "ObsEdit">>( );
  const setRollbackSnapshot = useStore( state => state.setRollbackSnapshot );
  const restoreRollbackSnapshot = useStore(
    state => state.restoreRollbackSnapshot,
  );
  const canRollbackToMatch = useStore( selectCanRollbackToMatch );
  const observations = useStore( state => state.observations );
  const currentObservationIndex = useStore(
    state => state.currentObservationIndex,
  );
  const backupMappings = useStore( state => state.backupMappings );
  const setBackupMappings = useStore( state => state.setBackupMappings );

  const hasBackedUp = useRef( false );

  useEffect( ( ) => {
    if ( hasBackedUp.current || canRollbackToMatch || params?.lastScreen !== "Match" ) return;

    hasBackedUp.current = true;
    setRollbackSnapshot( );
    backupObservationPhotos( observations, currentObservationIndex )
      .then( setBackupMappings );
  }, [
    canRollbackToMatch,
    currentObservationIndex,
    observations,
    params?.lastScreen,
    setBackupMappings,
    setRollbackSnapshot] );

  const rollback = useCallback( async ( ) => {
    if ( backupMappings.length > 0 ) {
      await restoreObservationPhotos( backupMappings );
    }
    restoreRollbackSnapshot( );
  }, [backupMappings, restoreRollbackSnapshot] );

  return { rollback, canRollbackToMatch };
}

export default useObsEditRollback;
