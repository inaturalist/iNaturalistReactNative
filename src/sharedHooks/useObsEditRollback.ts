import { useRoute } from "@react-navigation/native";
import cloneDeep from "lodash/cloneDeep";
import { useCallback, useRef } from "react";
import useStore from "stores/useStore";

function useObsEditRollback( ): { rollback: ( ) => void } {
  const { params } = useRoute( );
  const observations = useStore( s => s.observations );
  const currentObservationIndex = useStore( s => s.currentObservationIndex );
  const cameraUris = useStore( s => s.cameraUris );
  const cameraRollUris = useStore( s => s.cameraRollUris );
  const photoLibraryUris = useStore( s => s.photoLibraryUris );
  const evidenceToAdd = useStore( s => s.evidenceToAdd );
  const newPhotoUris = useStore( s => s.newPhotoUris );
  const unsavedChanges = useStore( s => s.unsavedChanges );
  const restoreRollbackSnapshot = useStore( s => s.restoreRollbackSnapshot );
  const snapshot = useRef( null );

  // Capture snapshot synchronously on first render when entering from Match.
  // The null guard ensures this runs exactly once. By the time ObsEdit first
  // renders, prepareObsEdit() and updateObservationKeys({taxon}) have already
  // been called synchronously before navigation.navigate("ObsEdit").
  if ( snapshot.current === null && params?.lastScreen === "Match" ) {
    snapshot.current = {
      observations: cloneDeep( observations ),
      currentObservationIndex,
      cameraUris: [...cameraUris],
      cameraRollUris: [...cameraRollUris],
      photoLibraryUris: [...photoLibraryUris],
      evidenceToAdd: [...evidenceToAdd],
      newPhotoUris: [...newPhotoUris],
      unsavedChanges,
    };
  }

  const rollback = useCallback( ( ) => {
    if ( snapshot.current ) {
      restoreRollbackSnapshot( snapshot.current );
    }
  }, [restoreRollbackSnapshot] );

  return { rollback };
}

export default useObsEditRollback;
