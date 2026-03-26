import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useRef } from "react";
import type { BackupMapping } from "sharedHelpers/rollbackPhotos";
import {
  backupObservationPhotos,
  restoreObservationPhotos,
} from "sharedHelpers/rollbackPhotos";
import { selectCanRollbackToMatch } from "stores/createObservationFlowSlice";
import useStore from "stores/useStore";

interface ObsEditRollbackParams {
  [name: string]: {
    lastScreen?: string;
  };
}

interface ObsEditRollbackReturn {
  rollback: ( ) => Promise<void>;
  canRollbackToMatch: boolean;
}

function useObsEditRollback( ): ObsEditRollbackReturn {
  const { params } = useRoute<RouteProp<ObsEditRollbackParams, string>>( );
  const hasSnapshot = useStore( state => state.rollbackSnapshot !== null );
  const setRollbackSnapshot = useStore( state => state.setRollbackSnapshot );
  const restoreRollbackSnapshot = useStore(
    state => state.restoreRollbackSnapshot,
  );
  const canRollbackToMatch = useStore( selectCanRollbackToMatch );
  const observations = useStore( state => state.observations );
  const currentObservationIndex = useStore(
    state => state.currentObservationIndex,
  );
  const backupMappingsRef = useRef<BackupMapping[]>( [] );

  useEffect( ( ) => {
    if ( !hasSnapshot && params?.lastScreen === "Match" ) {
      setRollbackSnapshot( );
      const doBackup = async ( ) => {
        backupMappingsRef.current = await backupObservationPhotos(
          observations,
          currentObservationIndex,
        );
      };
      doBackup( );
    }
  }, [
    params?.lastScreen,
    hasSnapshot,
    setRollbackSnapshot,
  ] );

  const rollback = useCallback( async ( ) => {
    if ( backupMappingsRef.current.length > 0 ) {
      await restoreObservationPhotos( backupMappingsRef.current );
    }
    restoreRollbackSnapshot( );
  }, [restoreRollbackSnapshot] );

  return { rollback, canRollbackToMatch };
}

export default useObsEditRollback;
