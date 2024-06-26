import { useNavigation } from "@react-navigation/native";
import { deactivateKeepAwake } from "@sayem314/react-native-keep-awake";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect
} from "react";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "sharedHelpers/emitUploadProgress";
import { log } from "sharedHelpers/logger";
import uploadObservation, { handleUploadError } from "sharedHelpers/uploadObservation";
import {
  useLocalObservations,
  useTranslation
} from "sharedHooks";
import {
  UPLOAD_CANCELLED,
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

const logger = log.extend( "useUploadObservations" );

export const MS_BEFORE_TOOLBAR_RESET = 5_000;
const MS_BEFORE_UPLOAD_TIMES_OUT = 60_000 * 5;

const { useRealm } = RealmContext;

// eslint-disable-next-line no-undef
export default useUploadObservations = canUpload => {
  const realm = useRealm( );

  const addUploadError = useStore( state => state.addUploadError );
  const completeUploads = useStore( state => state.completeUploads );
  const currentUpload = useStore( state => state.currentUpload );
  const removeDeletedObsFromUploadQueue = useStore(
    state => state.removeDeletedObsFromUploadQueue
  );
  const removeFromUploadQueue = useStore( state => state.removeFromUploadQueue );
  const resetUploadObservationsSlice = useStore( state => state.resetUploadObservationsSlice );
  const setCurrentUpload = useStore( state => state.setCurrentUpload );
  const updateTotalUploadProgress = useStore( state => state.updateTotalUploadProgress );
  const uploadQueue = useStore( state => state.uploadQueue );
  const uploadStatus = useStore( state => state.uploadStatus );
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  const setTotalToolbarIncrements = useStore( state => state.setTotalToolbarIncrements );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const setUploadStatus = useStore( state => state.setUploadStatus );
  const resetSyncToolbar = useStore( state => state.resetSyncToolbar );
  const initialNumObservationsInQueue = useStore( state => state.initialNumObservationsInQueue );

  const { unsyncedUuids } = useLocalObservations( );

  // The existing abortController lets you abort...
  const abortController = useStore( storeState => storeState.abortController );
  // ...but whenever you start a new abortable upload process, you need to
  //    mint a new abort controller
  const newAbortController = useStore( storeState => storeState.newAbortController );

  const navigation = useNavigation( );
  const { t } = useTranslation( );

  useEffect( () => {
    // eslint-disable-next-line no-undef
    let timer: number | NodeJS.Timeout;
    if ( [UPLOAD_COMPLETE, UPLOAD_CANCELLED].indexOf( uploadStatus ) >= 0 ) {
      timer = setTimeout( () => {
        resetUploadObservationsSlice( );
        const unsynced = Observation.filterUnsyncedObservations( realm );
        setNumUnuploadedObservations( unsynced.length );
      }, MS_BEFORE_TOOLBAR_RESET );
    } else {
      timer = setTimeout( () => {
        resetSyncToolbar( );
        const unsynced = Observation.filterUnsyncedObservations( realm );
        setNumUnuploadedObservations( unsynced.length );
      }, MS_BEFORE_TOOLBAR_RESET );
    }
    return () => {
      clearTimeout( timer );
    };
  }, [
    realm,
    resetSyncToolbar,
    resetUploadObservationsSlice,
    setNumUnuploadedObservations,
    uploadStatus
  ] );

  useEffect( ( ) => {
    const progressListener = EventRegister.addEventListener(
      INCREMENT_SINGLE_UPLOAD_PROGRESS,
      increments => {
        const uuid = increments[0];
        const increment = increments[1];
        updateTotalUploadProgress( uuid, increment );
      }
    );
    return ( ) => {
      EventRegister?.removeEventListener( progressListener );
    };
  }, [
    updateTotalUploadProgress
  ] );

  const uploadObservationAndCatchError = useCallback( async observation => {
    const { uuid } = observation;
    setCurrentUpload( observation );
    try {
      const timeoutID = setTimeout( ( ) => abortController.abort( ), MS_BEFORE_UPLOAD_TIMES_OUT );
      await uploadObservation( observation, realm, { signal: abortController.signal } );
      clearTimeout( timeoutID );
    } catch ( uploadErr ) {
      const uploadError = uploadErr as Error;
      if ( uploadError.name === "AbortError" ) {
        addUploadError( "aborted", observation.uuid );
      } else {
        const message = handleUploadError( uploadError, t );
        if ( message?.match( /That observation no longer exists./ ) ) {
          // 20240531 amanda - it seems like we have to update the UI
          // for the progress bar before actually deleting the observation
          // locally, otherwise Realm will throw an error while trying
          // to load the individual progress for a deleted observation
          removeDeletedObsFromUploadQueue( uuid );
          await Observation.deleteLocalObservation( realm, uuid );
        } else {
          addUploadError( message, uuid );
        }
      }
    } finally {
      removeFromUploadQueue( );
      if (
        uploadQueue.length === 0
        && !currentUpload
      ) {
        completeUploads( );
      }
    }
  }, [
    abortController,
    addUploadError,
    completeUploads,
    currentUpload,
    realm,
    removeDeletedObsFromUploadQueue,
    removeFromUploadQueue,
    setCurrentUpload,
    t,
    uploadQueue
  ] );

  useEffect( ( ) => {
    const startUpload = async ( ) => {
      const lastQueuedUuid = uploadQueue[uploadQueue.length - 1];
      const localObservation = realm.objectForPrimaryKey( "Observation", lastQueuedUuid );
      if ( localObservation ) {
        await uploadObservationAndCatchError( localObservation );
      }
    };
    if (
      uploadStatus === UPLOAD_IN_PROGRESS
      && uploadQueue.length > 0
      && !currentUpload
    ) {
      const startingNewUploadQueue = initialNumObservationsInQueue === uploadQueue.length;
      if ( startingNewUploadQueue ) {
        // We want the same abort controller for the entire upload queue so
        // cancelling cancels every request
        newAbortController( );
      }
      startUpload( );
    }
  }, [
    currentUpload,
    initialNumObservationsInQueue,
    newAbortController,
    realm,
    uploadObservationAndCatchError,
    uploadQueue,
    uploadStatus
  ] );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        resetUploadObservationsSlice( );
      } );
    },
    [
      navigation,
      resetUploadObservationsSlice
    ]
  );

  useEffect( ( ) => {
    // fully stop uploads when cancel upload button is tapped
    if ( uploadStatus === UPLOAD_CANCELLED ) {
      abortController.abort( );
      deactivateKeepAwake( );
    }
  }, [abortController, uploadStatus] );

  const startUpload = useCallback( ( ) => {
    if ( canUpload ) {
      logger.debug( "sync #4.2: starting upload" );
      setUploadStatus( UPLOAD_IN_PROGRESS );
    } else {
      setUploadStatus( UPLOAD_PENDING );
    }
  }, [
    canUpload,
    setUploadStatus
  ] );

  const createUploadQueue = useCallback( ( ) => {
    const uuidsQuery = unsyncedUuids.map( uploadUuid => `'${uploadUuid}'` ).join( ", " );
    const uploads = realm.objects( "Observation" )
      .filtered( `uuid IN { ${uuidsQuery} }` );
    setTotalToolbarIncrements( uploads );
    addToUploadQueue( unsyncedUuids );
    startUpload( );
  }, [
    realm,
    setTotalToolbarIncrements,
    unsyncedUuids,
    addToUploadQueue,
    startUpload
  ] );

  const uploadObservations = useCallback( async ( ) => {
    logger.debug( "sync #4.1: creating upload queue" );
    createUploadQueue( );
  }, [
    createUploadQueue
  ] );

  return {
    uploadObservations
  };
};
