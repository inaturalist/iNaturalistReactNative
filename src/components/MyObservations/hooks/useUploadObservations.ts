import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  adjustIconicTaxaObservationCount,
} from "components/MyObservations/hooks/useIconicTaxaObservationCounts";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useMemo,
} from "react";
import { EventRegister } from "react-native-event-listeners";
import Observation from "realmModels/Observation";
import type { RealmObservation } from "realmModels/types";
import { iconicTaxaGroupForTaxonName } from "sharedHelpers/iconicTaxaGroupOrder";
import {
  useCurrentUser,
  useTranslation,
} from "sharedHooks";
import {
  UPLOAD_CANCELLED,
  UPLOAD_COMPLETE,
  UPLOAD_IN_PROGRESS,
} from "stores/createUploadObservationsSlice";
import useStore from "stores/useStore";
import uploadObservation from "uploaders/observationUploader";
import handleUploadError, { RECOVERY_BY } from "uploaders/utils/errorHandling";
import { persistObservationUploadError } from "uploaders/utils/persistUploadError";
import {
  INCREMENT_SINGLE_UPLOAD_PROGRESS,
} from "uploaders/utils/progressTracker";

export const MS_BEFORE_TOOLBAR_RESET = 5_000;
export const MS_BEFORE_UPLOAD_TIMES_OUT = 60_000 * 5;

const { useRealm } = RealmContext;

// eslint-disable-next-line no-undef
export default ( canUpload: boolean ) => {
  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );

  const addFirstUploadUuid = useStore( state => state.addFirstUploadUuid );
  const addUploadError = useStore( state => state.addUploadError );
  const completeUploads = useStore( state => state.completeUploads );
  const currentUpload = useStore( state => state.currentUpload );
  const removeDeletedObsFromUploadQueue = useStore(
    state => state.removeDeletedObsFromUploadQueue,
  );
  const removeFromUploadQueue = useStore( state => state.removeFromUploadQueue );
  const resetUploadObservationsSlice = useStore( state => state.resetUploadObservationsSlice );
  const setCurrentUpload = useStore( state => state.setCurrentUpload );
  const updateTotalUploadProgress = useStore( state => state.updateTotalUploadProgress );
  const uploadQueue = useStore( state => state.uploadQueue );
  const uploadStatus = useStore( state => state.uploadStatus );
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

  useEffect( () => {
    // eslint-disable-next-line no-undef
    let timer: number | NodeJS.Timeout;
    if ( [UPLOAD_COMPLETE, UPLOAD_CANCELLED].indexOf( uploadStatus ) >= 0 ) {
      timer = setTimeout( () => {
        resetUploadObservationsSlice( );
      }, MS_BEFORE_TOOLBAR_RESET );
    } else {
      timer = setTimeout( () => {
        resetSyncToolbar( );
      }, MS_BEFORE_TOOLBAR_RESET );
    }
    return () => {
      clearTimeout( timer );
    };
  }, [
    resetSyncToolbar,
    resetUploadObservationsSlice,
    uploadStatus,
  ] );

  useEffect( ( ) => {
    const progressListener = EventRegister.addEventListener(
      INCREMENT_SINGLE_UPLOAD_PROGRESS,
      increments => {
        const uuid = increments[0];
        const increment = increments[1];
        updateTotalUploadProgress( uuid, increment );
      },
    );
    return ( ) => {
      EventRegister?.removeEventListener( progressListener as string );
    };
  }, [
    updateTotalUploadProgress,
  ] );

  const uploadObservationAndCatchError = useCallback( async ( observation: RealmObservation ) => {
    const { uuid } = observation;
    // Recorded before uploading, since needs_sync clears as soon as the server creates the
    // record, while photos are still uploading. Edits to an uploaded observation aren't recorded.
    const isFirstUpload = !observation._synced_at;
    if ( isFirstUpload ) addFirstUploadUuid( uuid );
    setCurrentUpload( observation );
    // Each upload gets its own abort controller so that a timeout only
    // cancels this observation and the queue can advance. The store's
    // session-level abortController only aborts when the user stops all
    // uploads, which cascades here through the listener.
    const obsAbortController = new AbortController( );
    const abortCurrentUpload = ( ) => obsAbortController.abort( );
    let timeoutID: ReturnType<typeof setTimeout> | undefined;
    try {
      abortController?.signal.addEventListener( "abort", abortCurrentUpload );
      timeoutID = setTimeout( abortCurrentUpload, MS_BEFORE_UPLOAD_TIMES_OUT );
      await uploadObservation( observation, realm, { signal: obsAbortController.signal } );
    } catch ( uploadErr ) {
      const uploadError = uploadErr as Error;
      // stop here if user-initiated. finally still runs.
      if ( abortController?.signal.aborted ) {
        return;
      }
      if ( uploadError.name === "AbortError" ) {
        // Only a per-observation timeout reaches here now
        addUploadError( "aborted", uuid );
      } else {
        const { message, recoveryPossible, recoveryBy } = handleUploadError( uploadError, t );
        persistObservationUploadError( realm, observation, message );
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
      // Re-read, since the upload can fail after creating the record, or delete it locally
      const uploaded = realm.objectForPrimaryKey<RealmObservation>( "Observation", uuid );
      if ( isFirstUpload && uploaded?._synced_at ) {
        adjustIconicTaxaObservationCount(
          queryClient,
          currentUser?.id,
          iconicTaxaGroupForTaxonName( uploaded.taxon?.iconic_taxon_name ),
          1,
        );
      }
      clearTimeout( timeoutID );
      abortController?.signal.removeEventListener( "abort", abortCurrentUpload );
      if ( !abortController?.signal.aborted ) {
        // stopAllUploads already cleared the queue if the top level controller was aborted
        // so don't do it a second time if it was
        removeFromUploadQueue( );
        if (
          uploadQueue.length === 0
          && !currentUpload
        ) {
          completeUploads( );
        }
      }
    }
  }, [
    abortController,
    addFirstUploadUuid,
    addUploadError,
    completeUploads,
    currentUpload,
    currentUser?.id,
    queryClient,
    realm,
    removeDeletedObsFromUploadQueue,
    removeFromUploadQueue,
    setCurrentUpload,
    t,
    uploadQueue,
    navigation,
    stopAllUploads,
  ] );

  useEffect( ( ) => {
    const uploadNextObservation = async ( ) => {
      const lastQueuedUuid = uploadQueue[uploadQueue.length - 1];
      const localObservation = realm.objectForPrimaryKey<RealmObservation>(
        "Observation",
        lastQueuedUuid,
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
    uploadStatus,
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
    unsyncedUuids,
  ] );

  const startUploadObservations = useCallback( async ( skipSomeUuids: string[] | undefined ) => {
    createUploadQueueAllUnsynced( skipSomeUuids );
  }, [
    createUploadQueueAllUnsynced,
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
    setStartUploadObservations,
  ] );

  return {
    startUploadObservations,
    startUploadsFromMultiObsEdit,
  };
};
