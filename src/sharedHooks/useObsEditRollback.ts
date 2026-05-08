import { useCallback } from "react";
import { restoreObservationPhotos } from "sharedHelpers/rollbackPhotos";
import { selectCanRollbackToMatch } from "stores/createObservationFlowSlice";
import useStore from "stores/useStore";

interface ObsEditRollbackReturn {
  rollback: ( ) => Promise<void>;
  canRollbackToMatch: boolean;
}

function useObsEditRollback( ): ObsEditRollbackReturn {
  const restoreRollbackSnapshot = useStore(
    state => state.restoreRollbackSnapshot,
  );
  const canRollbackToMatch = useStore( selectCanRollbackToMatch );
  const backupMappings = useStore( state => state.backupMappings );

  const rollback = useCallback( async ( ) => {
    if ( backupMappings.length > 0 ) {
      await restoreObservationPhotos( backupMappings );
    }
    restoreRollbackSnapshot( );
  }, [backupMappings, restoreRollbackSnapshot] );

  return { rollback, canRollbackToMatch };
}

export default useObsEditRollback;
