import { RealmContext } from "providers/contexts.ts";
import {
  useCallback, useMemo, useState
} from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import BackgroundService from "react-native-background-actions";
import Observation from "realmModels/Observation";
import type { RealmObservation } from "realmModels/types.d.ts";
import uploadObservation, { handleUploadError } from "sharedHelpers/uploadObservation";
import {
  useTranslation
} from "sharedHooks";
import useStore from "stores/useStore";

export const MS_BEFORE_TOOLBAR_RESET = 5_000;

const { useRealm } = RealmContext;

const backgroundConfig = {
  taskKey: "ObservationUpload",
  notificationTitle: "Uploading Observations",
  notificationText: "Uploading observations in background"
};

// eslint-disable-next-line no-undef
export default ( canUpload: boolean ) => {
  const realm = useRealm( );

  const addUploadError = useStore( state => state.addUploadError );
  const completeUploads = useStore( state => state.completeUploads );
  const removeDeletedObsFromUploadQueue = useStore(
    state => state.removeDeletedObsFromUploadQueue
  );
  const removeFromUploadQueue = useStore( state => state.removeFromUploadQueue );
  const setCurrentUpload = useStore( state => state.setCurrentUpload );
  const updateTotalUploadProgress = useStore( state => state.updateTotalUploadProgress );
  const uploadQueue = useStore( state => state.uploadQueue );
  const setTotalToolbarIncrements = useStore( state => state.setTotalToolbarIncrements );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const setStartUploadObservations = useStore( state => state.setStartUploadObservations );
  const setCannotUploadObservations = useStore( state => state.setCannotUploadObservations );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );

  const [isUploading, setIsUploading] = useState( false );

  const unsyncedList = Observation.filterUnsyncedObservations( realm );
  const unsyncedUuids = useMemo( ( ) => unsyncedList.map( o => o.uuid ), [unsyncedList] );
  const { t } = useTranslation( );

  const catchUploadError = useCallback( async ( uploadErr, uuid ) => {
    const uploadError = uploadErr as Error;
    if ( uploadError.name === "AbortError" ) {
      addUploadError( "aborted", uuid );
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
  }, [addUploadError, realm, removeDeletedObsFromUploadQueue, t] );

  const uploadSingleObservation = useCallback( async ( observation: RealmObservation ) => {
    const { uuid } = observation;

    try {
      setCurrentUpload( observation );
      BackgroundService.updateNotification( {
        taskDesc: `Uploading observation ${uuid}`
      } );
      await uploadObservation( observation, realm, {
        updateTotalUploadProgress
      } );
    } catch ( uploadErr ) {
      catchUploadError( uploadErr, uuid );
    } finally {
      removeFromUploadQueue( );
    }
  }, [
    catchUploadError,
    realm,
    removeFromUploadQueue,
    setCurrentUpload,
    updateTotalUploadProgress
  ] );

  const backgroundUploadTask = useCallback( async ( ) => {
    if ( !canUpload ) {
      BackgroundService.stop( );
      return;
    }

    try {
      setIsUploading( true );

      uploadQueue.forEach( async uuid => {
        // Check if service should stop
        const isBackgroundServiceRunning = await BackgroundService.isRunning( );
        if ( isBackgroundServiceRunning === false ) { return; }

        const observation = realm.objectForPrimaryKey( "Observation", uuid );

        if ( observation ) {
          await uploadSingleObservation( observation );
        }
      } );

      completeUploads( );
    } catch ( error ) {
      console.error( "Background upload error:", error );
    } finally {
      setIsUploading( false );
      BackgroundService.stop( );
    }
  }, [
    canUpload,
    completeUploads,
    realm,
    uploadQueue,
    uploadSingleObservation
  ] );

  const startUploadObservations = useCallback( async ( ) => {
    if ( !canUpload ) {
      setCannotUploadObservations( );
      return;
    }

    const uuidsQuery = unsyncedUuids
      .map( ( uploadUuid: string ) => `'${uploadUuid}'` ).join( ", " );
    const uploads = realm.objects( "Observation" )
      .filtered( `uuid IN { ${uuidsQuery} }` );

    setTotalToolbarIncrements( uploads );
    addToUploadQueue( unsyncedUuids );
    setStartUploadObservations( );

    // Start background service
    try {
      await BackgroundService.start( backgroundUploadTask, {
        ...backgroundConfig,
        taskName: "UploadAllUnsyncedObservations"
      } );
    } catch ( error ) {
      console.error( "Failed to start background upload:", error );
      setCannotUploadObservations( );
    }
  }, [
    addToUploadQueue,
    backgroundUploadTask,
    canUpload,
    realm,
    setCannotUploadObservations,
    setStartUploadObservations,
    setTotalToolbarIncrements,
    unsyncedUuids
  ] );

  const startIndividualUpload = useCallback( async ( uuid: string ) => {
    if ( !canUpload ) {
      setCannotUploadObservations( );
      return;
    }

    const observation = realm.objectForPrimaryKey( "Observation", uuid );

    if ( !observation ) {
      console.error( "Observation not found" );
      return;
    }

    // Add to upload queue
    addTotalToolbarIncrements( observation );
    addToUploadQueue( uuid );

    if ( isUploading ) { return; }
    // Start background service specifically for this observation
    try {
      await BackgroundService.start(
        backgroundUploadTask,
        {
          ...backgroundConfig,
          taskName: "UploadSingleObservation"
        }
      );

      // Pass the specific UUID to upload
      await backgroundUploadTask( { uuids: [uuid] } );
    } catch ( error ) {
      console.error( "Failed to start individual background upload:", error );
      setCannotUploadObservations();
    }
  }, [
    addTotalToolbarIncrements,
    addToUploadQueue,
    backgroundUploadTask,
    canUpload,
    isUploading,
    realm,
    setCannotUploadObservations
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
    startIndividualUpload,
    startUploadObservations,
    startUploadsFromMultiObsEdit,
    isUploading
  };
};
