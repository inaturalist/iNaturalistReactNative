import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { useCallback, useEffect } from "react";
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

  useEffect( ( ) => {
    if ( !canRollbackToMatch && params?.lastScreen === "Match" ) {
      setRollbackSnapshot( );
      const doBackup = async ( ) => {
        const mappings = await backupObservationPhotos(
          observations,
          currentObservationIndex,
        );
        setBackupMappings( mappings );
      };
      doBackup( );
    }
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
