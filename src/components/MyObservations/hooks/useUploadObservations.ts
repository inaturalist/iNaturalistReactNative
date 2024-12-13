import { RealmContext } from "providers/contexts.ts";
import {
  useCallback, useEffect,
  useMemo, useState
} from "react";
import BackgroundService from "react-native-background-actions";
import Observation from "realmModels/Observation";
import type { RealmObservation } from "realmModels/types.d.ts";
import uploadObservation, { handleUploadError } from "sharedHelpers/uploadObservation";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

const MS_BEFORE_UPLOAD_TIMES_OUT = 60_000 * 5; // 5 minutes
const BACKGROUND_TASK_NAME = "ObservationUpload";

export interface UploadOptions {
  signal?: AbortSignal;
  updateTotalUploadProgress?: ( uuid: string, increment: number ) => void;
}

export default function useUploadObservations( canUpload: boolean ) {
  const realm = useRealm( );
  const { t } = useTranslation( );

  const addUploadError = useStore( state => state.addUploadError );
  const completeUploads = useStore( state => state.completeUploads );
  const removeDeletedObsFromUploadQueue = useStore(
    state => state.removeDeletedObsFromUploadQueue
  );
  const removeFromUploadQueue = useStore( state => state.removeFromUploadQueue );
  const updateTotalUploadProgress = useStore( state => state.updateTotalUploadProgress );
  const setCannotUploadObservations = useStore( state => state.setCannotUploadObservations );
  const incrementNumUploadsAttempted = useStore( state => state.incrementNumUploadsAttempted );
  const uploadQueue = useStore( state => state.uploadQueue );
  const abortController = useStore( state => state.abortController );
  const addObservationsToUploadQueue = useStore( state => state.addObservationsToUploadQueue );
  const setStartUploadObservations = useStore( state => state.setStartUploadObservations );

  const [isUploading, setIsUploading] = useState( false );

  const unsyncedList = useMemo(
    ( ) => Observation.filterUnsyncedObservations( realm ),
    [realm]
  );

  const catchUploadError = useCallback( async ( error: Error, uuid: string ) => {
    if ( error.name === "AbortError" ) {
      addUploadError( "Upload cancelled", uuid );
      return;
    }

    const message = handleUploadError( error, t );

    if ( message?.match( /That observation no longer exists/ ) ) {
      removeDeletedObsFromUploadQueue( uuid );
      await Observation.deleteLocalObservation( realm, uuid );
    } else {
      addUploadError( message, uuid );
    }
  }, [realm, t, addUploadError, removeDeletedObsFromUploadQueue] );

  const stopBackgroundService = useCallback( async ( ) => {
    setIsUploading( false );

    abortController?.abort( );

    try {
      await BackgroundService.stop( );
      completeUploads( );
    } catch ( error ) {
      console.error( "Error stopping background service:", error );
    }
  }, [abortController, completeUploads] );

  const uploadSingleObservation = useCallback( async (
    observation: RealmObservation,
    options: UploadOptions = {}
  ) => {
    const { uuid } = observation;

    const uploadSignal = options.signal || abortController?.signal;

    try {
      await BackgroundService.updateNotification( {
        taskDesc: `Uploading observation ${uuid}`
      } );

      const timeoutId = setTimeout( ( ) => {
        abortController?.abort( );
      }, MS_BEFORE_UPLOAD_TIMES_OUT );

      await uploadObservation( observation, realm, {
        signal: uploadSignal,
        updateTotalUploadProgress
      } );

      clearTimeout( timeoutId );
    } catch ( error ) {
      await catchUploadError( error as Error, uuid );
    } finally {
      removeFromUploadQueue( );
      completeUploads( );
    }
  }, [
    realm,
    catchUploadError,
    removeFromUploadQueue,
    updateTotalUploadProgress,
    completeUploads,
    abortController
  ] );

  const backgroundUploadTask = useCallback( async ( ) => {
    if ( !canUpload ) {
      await BackgroundService.stop( );
      return;
    }

    setIsUploading( true );

    const processQueue = async ( ) => {
      if ( uploadQueue.length === 0 ) {
        await stopBackgroundService( );
        return;
      }

      const uuid = uploadQueue[0];
      const observation = realm.objectForPrimaryKey( "Observation", uuid );

      if ( !observation ) {
        removeFromUploadQueue( );
        await processQueue( );
        return;
      }

      incrementNumUploadsAttempted( );

      try {
        await uploadSingleObservation( observation );
        await processQueue( );
      } catch ( error ) {
        console.error( "Background upload error:", error );
        await stopBackgroundService( );
      }
    };

    await processQueue( );
  }, [
    canUpload,
    realm,
    uploadSingleObservation,
    uploadQueue,
    removeFromUploadQueue,
    incrementNumUploadsAttempted,
    stopBackgroundService
  ] );

  const startBackgroundUploadService = useCallback( async ( ) => {
    if ( !canUpload ) {
      setCannotUploadObservations( );
      return;
    }

    setStartUploadObservations( );

    try {
      await BackgroundService.start( backgroundUploadTask, {
        taskKey: BACKGROUND_TASK_NAME,
        taskName: "Upload Observations",
        notificationTitle: "Uploading Observations",
        notificationText: "Uploading observations in background"
      } );
    } catch ( error ) {
      console.error( "Failed to start background upload:", error );
      setCannotUploadObservations( );
    }
  }, [
    backgroundUploadTask,
    canUpload,
    setCannotUploadObservations,
    setStartUploadObservations
  ] );

  // Event listener for queue changes
  useEffect( ( ) => {
    const handleQueueChange = async ( ) => {
      const isBackgroundServiceRunning = await BackgroundService.isRunning( );

      // If queue is not empty and background service is not running, start it
      if ( uploadQueue.length > 0 && !isBackgroundServiceRunning ) {
        await startBackgroundUploadService( );
      }
    };

    handleQueueChange( );
  }, [uploadQueue, startBackgroundUploadService] );

  const startUploadObservations = useCallback( async ( ) => {
    if ( !canUpload ) return;
    addObservationsToUploadQueue( unsyncedList );
  }, [
    canUpload,
    unsyncedList,
    addObservationsToUploadQueue
  ] );

  const startIndividualUpload = useCallback( async ( uuid: string ) => {
    if ( !canUpload ) return;

    const observation = realm.objectForPrimaryKey( "Observation", uuid );
    if ( !observation ) {
      console.error( "Observation not found" );
      return;
    }
    addObservationsToUploadQueue( [observation] );
  }, [
    canUpload,
    realm,
    addObservationsToUploadQueue
  ] );

  return {
    startIndividualUpload,
    startUploadObservations,
    stopUpload: stopBackgroundService,
    isUploading
  };
}
