import { useNavigation } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useMemo
} from "react";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import type { RealmObservation } from "realmModels/types.d";
import {
  useTranslation
} from "sharedHooks";
import {
  UPLOAD_CANCELLED,
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS
} from "stores/createUploadObservationsSlice";
import useStore from "stores/useStore";
import { handleUploadError } from "uploaders";
import uploadObservation from "uploaders/observationUploader";
import { RECOVERY_BY } from "uploaders/utils/errorHandling";
import {
  INCREMENT_SINGLE_UPLOAD_PROGRESS
} from "uploaders/utils/progressTracker";

export const MS_BEFORE_TOOLBAR_RESET = 5_000;
const MS_BEFORE_UPLOAD_TIMES_OUT = 60_000 * 5;

const { useRealm } = RealmContext;

// eslint-disable-next-line no-undef
export default ( canUpload: boolean ) => {
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
  const setStartUploadObservations = useStore( state => state.setStartUploadObservations );
  const setCannotUploadObservations = useStore( state => state.setCannotUploadObservations );
  const resetSyncToolbar = useStore( state => state.resetSyncToolbar );
  const initialNumObservationsInQueue = useStore( state => state.initialNumObservationsInQueue );
  const stopAllUploads = useStore( state => state.stopAllUploads );

  const unsyncedList = Observation.filterUnsyncedObservations( realm );
  const unsyncedUuids = useMemo( ( ) => unsyncedList.map( o => o.uuid ), [unsyncedList] );
  const abortController = useStore( storeState => storeState.abortController );

  const { t } = useTranslation( );
  const navigation = useNavigation( );

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
      EventRegister?.removeEventListener( progressListener as string );
    };
  }, [
    updateTotalUploadProgress
  ] );

  const uploadObservationAndCatchError = useCallback( async ( observation: RealmObservation ) => {
    const { uuid } = observation;
    setCurrentUpload( observation );
    try {
      const timeoutID = setTimeout( ( ) => {
        abortController.abort( );
      }, MS_BEFORE_UPLOAD_TIMES_OUT );
      await uploadObservation( observation, realm, { signal: abortController.signal } );
      clearTimeout( timeoutID );
    } catch ( uploadErr ) {
      const uploadError = uploadErr as Error;
      if ( uploadError.name === "AbortError" ) {
        addUploadError( "aborted", observation.uuid );
      } else {
        const { message, recoveryPossible, recoveryBy } = handleUploadError( uploadError, t );
        if ( message?.match( /That observation no longer exists./ ) ) {
          // 20240531 amanda - it seems like we have to update the UI
          // for the progress bar before actually deleting the observation
          // locally, otherwise Realm will throw an error while trying
          // to load the individual progress for a deleted observation
          removeDeletedObsFromUploadQueue( uuid );
          await Observation.deleteLocalObservation( realm, uuid );
        } else {
          addUploadError( message, uuid );
          if ( recoveryPossible && recoveryBy === RECOVERY_BY.LOGIN_AGAIN ) {
            // We are trying to upload observations without authentication tokens
            // so we need to log in again before we can continue.
            // Currently this is a workaround for more automatic recovery from this erroneous state.
            stopAllUploads( );
            navigation.navigate( "LoginStackNavigator" );
          }
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
    uploadQueue,
    navigation,
    stopAllUploads
  ] );

  useEffect( ( ) => {
    const uploadNextObservation = async ( ) => {
      const lastQueuedUuid = uploadQueue[uploadQueue.length - 1];
      const localObservation = realm.objectForPrimaryKey<RealmObservation>(
        "Observation",
        lastQueuedUuid
      );
      if ( localObservation ) {
        await uploadObservationAndCatchError( localObservation );
      }
    };
    if (
      uploadStatus === UPLOAD_IN_PROGRESS
      && uploadQueue.length > 0
      && !currentUpload
    ) {
      if ( abortController && !abortController.signal.aborted ) {
        uploadNextObservation( );
      }
    }
  }, [
    abortController,
    currentUpload,
    initialNumObservationsInQueue,
    realm,
    uploadObservationAndCatchError,
    uploadQueue,
    uploadStatus
  ] );

  const createUploadQueueAllUnsynced = useCallback( ( skipSomeUuids: string[] | undefined ) => {
    const uploadsUuids = unsyncedUuids
      .filter( ( uuid: string ) => !skipSomeUuids?.includes( uuid ) );
    if ( uploadsUuids.length === 0 ) {
      return;
    }
    const uuidsQuery = uploadsUuids
      .map( ( uploadUuid: string ) => `'${uploadUuid}'` ).join( ", " );
    const uploads = realm.objects( "Observation" )
      .filtered( `uuid IN { ${uuidsQuery} }` );
    setTotalToolbarIncrements( uploads );
    addToUploadQueue( uploadsUuids );
    if ( canUpload ) {
      setStartUploadObservations( );
    } else {
      setCannotUploadObservations( );
    }
  }, [
    addToUploadQueue,
    canUpload,
    realm,
    setCannotUploadObservations,
    setStartUploadObservations,
    setTotalToolbarIncrements,
    unsyncedUuids
  ] );

  const startUploadObservations = useCallback( async ( skipSomeUuids: string[] | undefined ) => {
    createUploadQueueAllUnsynced( skipSomeUuids );
  }, [
    createUploadQueueAllUnsynced
  ] );

  const startUploadsFromMultiObsEdit = useCallback( async ( ) => {
    if ( canUpload ) {
      setStartUploadObservations( );
    } else {
      setCannotUploadObservations( );
    }
  }, [
    canUpload,
    setCannotUploadObservations,
    setStartUploadObservations
  ] );

  return {
    startUploadObservations,
    startUploadsFromMultiObsEdit
  };
};
