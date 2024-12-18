import { RealmContext } from "providers/contexts.ts";
import {
  useCallback, useEffect
} from "react";
import Observation from "realmModels/Observation";
import {
  UPLOAD_CANCELLED,
  UPLOAD_COMPLETE
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

export const MS_BEFORE_TOOLBAR_RESET = 5_000;

const { useRealm } = RealmContext;

const useToolbarTimeout = ( uploadStatus: "string" ) => {
  const realm = useRealm( );
  const resetUploadObservationsSlice = useStore( state => state.resetUploadObservationsSlice );
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  const resetSyncToolbar = useStore( state => state.resetSyncToolbar );

  const resetNumUnsyncedObs = useCallback( ( ) => {
    if ( !realm || realm.isClosed ) return;
    const unsynced = Observation.filterUnsyncedObservations( realm );
    setNumUnuploadedObservations( unsynced.length );
  }, [realm, setNumUnuploadedObservations] );

  useEffect( () => {
    // eslint-disable-next-line no-undef
    let timer: number | NodeJS.Timeout;
    if ( [UPLOAD_COMPLETE, UPLOAD_CANCELLED].indexOf( uploadStatus ) >= 0 ) {
      timer = setTimeout( () => {
        resetUploadObservationsSlice( );
        resetNumUnsyncedObs( );
      }, MS_BEFORE_TOOLBAR_RESET );
    } else {
      timer = setTimeout( () => {
        resetSyncToolbar( );
        resetNumUnsyncedObs( );
      }, MS_BEFORE_TOOLBAR_RESET );
    }
    return () => {
      clearTimeout( timer );
    };
  }, [
    resetNumUnsyncedObs,
    resetSyncToolbar,
    resetUploadObservationsSlice,
    uploadStatus
  ] );
};

export default useToolbarTimeout;
