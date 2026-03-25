import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import cloneDeep from "lodash/cloneDeep";
import { useCallback, useEffect } from "react";
import useStore from "stores/useStore";

interface ObsEditRollbackParams {
  [name: string]: {
    lastScreen?: string;
  };
}

function useObsEditRollback( ): { rollback: ( ) => void; isFromMatch: boolean } {
  const { params } = useRoute<RouteProp<ObsEditRollbackParams, string>>( );
  const observations = useStore( state => state.observations );
  const currentObservationIndex = useStore( state => state.currentObservationIndex );
  const cameraUris = useStore( state => state.cameraUris );
  const cameraRollUris = useStore( state => state.cameraRollUris );
  const photoLibraryUris = useStore( state => state.photoLibraryUris );
  const evidenceToAdd = useStore( state => state.evidenceToAdd );
  const newPhotoUris = useStore( state => state.newPhotoUris );
  const unsavedChanges = useStore( state => state.unsavedChanges );
  const rollbackSnapshot = useStore( state => state.rollbackSnapshot );
  const setRollbackSnapshot = useStore( state => state.setRollbackSnapshot );
  const restoreRollbackSnapshot = useStore( state => state.restoreRollbackSnapshot );

  useEffect( ( ) => {
    if ( rollbackSnapshot === null && params?.lastScreen === "Match" ) {
      setRollbackSnapshot( {
        observations: cloneDeep( observations ),
        currentObservationIndex,
        cameraUris: [...cameraUris],
        cameraRollUris: [...cameraRollUris],
        photoLibraryUris: [...photoLibraryUris],
        evidenceToAdd: [...evidenceToAdd],
        newPhotoUris: [...newPhotoUris],
        unsavedChanges,
      } );
    }
  }, [
    cameraRollUris,
    cameraUris,
    currentObservationIndex,
    evidenceToAdd,
    newPhotoUris,
    observations,
    params?.lastScreen,
    photoLibraryUris,
    rollbackSnapshot,
    setRollbackSnapshot,
    unsavedChanges,
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
