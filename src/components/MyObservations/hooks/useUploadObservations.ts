import { RealmContext } from "providers/contexts.ts";
import {
  useCallback,
  useEffect,
  useMemo
} from "react";
import Observation from "realmModels/Observation";
import type { RealmObservation } from "realmModels/types.d.ts";
import uploadObservation, { handleUploadError } from "sharedHelpers/uploadObservation";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import { UPLOAD_IN_PROGRESS } from "../../../stores/createUploadObservationsSlice";
import useToolbarTimeout from "./useToolbarTimeout";

const { useRealm } = RealmContext;

const MS_BEFORE_UPLOAD_TIMES_OUT = 60_000 * 5; // 5 minutes

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
  // const setCannotUploadObservations = useStore( state => state.setCannotUploadObservations );
  const uploadQueue = useStore( state => state.uploadQueue );
  const abortController = useStore( state => state.abortController );
  const addObservationsToUploadQueue = useStore( state => state.addObservationsToUploadQueue );
  const setStartUploadObservations = useStore( state => state.setStartUploadObservations );
  const uploadStatus = useStore( state => state.uploadStatus );
  const currentUpload = useStore( state => state.currentUpload );
  const setCurrentUpload = useStore( state => state.setCurrentUpload );
  useToolbarTimeout( uploadStatus );

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

  const uploadSingleObservation = useCallback( async (
    observation: RealmObservation
  ) => {
    const { uuid } = observation;

    try {
      const timeoutId = setTimeout( ( ) => {
        abortController?.abort( );
      }, MS_BEFORE_UPLOAD_TIMES_OUT );

      await uploadObservation( observation, realm, {
        updateTotalUploadProgress
      } );

      clearTimeout( timeoutId );
    } catch ( error ) {
      await catchUploadError( error as Error, uuid );
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
    catchUploadError,
    completeUploads,
    currentUpload,
    realm,
    removeFromUploadQueue,
    updateTotalUploadProgress,
    uploadQueue
  ] );

  useEffect( ( ) => {
    const shouldStartUpload = canUpload
      && uploadQueue.length > 0
      && uploadStatus !== UPLOAD_IN_PROGRESS;

    const shouldProcessNextUpload = !currentUpload
      && abortController
      && !abortController.signal.aborted;

    if ( shouldStartUpload ) {
      setStartUploadObservations( );
    }

    if ( shouldProcessNextUpload ) {
      const processNextObservation = async () => {
        const lastQueuedUuid = uploadQueue[uploadQueue.length - 1];
        if ( !lastQueuedUuid ) { return; }
        const observation = realm.objectForPrimaryKey<RealmObservation>(
          "Observation",
          lastQueuedUuid
        );

        if ( !observation ) return;

        setCurrentUpload( observation );
        await uploadSingleObservation( observation );
      };

      processNextObservation( );
    }
  }, [
    canUpload,
    uploadQueue,
    uploadStatus,
    currentUpload,
    abortController,
    realm,
    setStartUploadObservations,
    setCurrentUpload,
    uploadSingleObservation
  ] );

  const addAllUnsyncedUploadsToQueue = useCallback( async ( ) => {
    if ( !canUpload ) return;
    addObservationsToUploadQueue( unsyncedList );
  }, [
    canUpload,
    unsyncedList,
    addObservationsToUploadQueue
  ] );

  const addIndividualUploadToQueue = useCallback( async ( uuid: string ) => {
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
    startIndividualUpload: addIndividualUploadToQueue,
    startUploadObservations: addAllUnsyncedUploadsToQueue
  };
}
