import { INatApiError } from "api/error";
import { deleteRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect } from "react";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";
import {
  AUTOMATIC_SYNC_IN_PROGRESS,
  BEGIN_AUTOMATIC_SYNC,
  BEGIN_MANUAL_SYNC,
  MANUAL_SYNC_IN_PROGRESS
} from "stores/createSyncObservationsSlice.ts";
import useStore from "stores/useStore";

import syncRemoteDeletedObservations from "../helpers/syncRemoteDeletedObservations";
import syncRemoteObservations from "../helpers/syncRemoteObservations";

const logger = log.extend( "useSyncObservations" );

const { useRealm } = RealmContext;

const useSyncObservations = ( currentUserId, uploadObservations ): Object => {
  const loggedIn = !!currentUserId;
  const deletions = useStore( state => state.deletions );
  const deletionsCompletedAt = useStore( state => state.deletionsCompletedAt );
  const currentDeleteCount = useStore( state => state.currentDeleteCount );
  const completeLocalDeletions = useStore( state => state.completeLocalDeletions );
  const startNextDeletion = useStore( state => state.startNextDeletion );
  const setDeletionError = useStore( state => state.setDeletionError );
  const observationToDelete = deletions[currentDeleteCount - 1];
  const uuidToDelete = observationToDelete?.uuid;
  const canDeleteRemoteObservation = observationToDelete?._synced_at && loggedIn;
  const syncingStatus = useStore( state => state.syncingStatus );
  const setSyncingStatus = useStore( state => state.setSyncingStatus );
  const completeSync = useStore( state => state.completeSync );
  const resetSyncToolbar = useStore( state => state.resetSyncToolbar );

  const realm = useRealm( );

  const deleteRealmObservation = useCallback( async ( ) => {
    await Observation.deleteLocalObservation( realm, uuidToDelete );
  }, [realm, uuidToDelete] );

  const handleRemoteDeletion = useAuthenticatedMutation(
    ( params, optsWithAuth ) => deleteRemoteObservation( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        logger.debug(
          "Remote observation deleted, now deleting local observation"
        );
        deleteRealmObservation( );
      },
      onError: deleteObservationError => {
        setDeletionError( deleteObservationError );
        // If we tried to delete and got a 404, this observation doesn't exist
        // on the server any more and should be deleted locally
        if ( deleteObservationError?.status === 404 ) {
          deleteRealmObservation( );
        } else {
          throw deleteObservationError;
        }
      }
    }
  );

  const deleteLocalObservations = useCallback( async ( ) => {
    const deleteRemoteObservationAndCatchError = ( ) => {
      handleRemoteDeletion.mutate( { uuid: uuidToDelete } );
    };

    if ( deletions.length === 0 ) { return; }

    deletions.forEach( async ( observation, i ) => {
      if ( !canDeleteRemoteObservation ) {
        return deleteRealmObservation( );
      }
      await deleteRemoteObservationAndCatchError( );

      if ( i > 0 ) {
        // this loop isn't really being used, since a user can only delete one
        // observation at a time in soft launch. eventually, we'll probably want
        // a deletion queue, similar to the uploads queue
        startNextDeletion( );
      }
      if ( i === deletions.length - 1 ) {
        completeLocalDeletions( );
      }
      return null;
    } );
  }, [
    canDeleteRemoteObservation,
    uuidToDelete,
    deleteRealmObservation,
    handleRemoteDeletion,
    deletions,
    completeLocalDeletions,
    startNextDeletion
  ] );

  const fetchRemoteDeletions = useCallback( async ( ) => {
    try {
      await syncRemoteDeletedObservations( realm );
      return true;
    } catch ( syncRemoteError ) {
      // For some reason this seems to run even when signed out, in which
      // case we end up sending no JWT or the anon JWT, wich fails auth. If
      // that happens, we can just return and call it a day.
      if (
        syncRemoteError instanceof INatApiError
          && syncRemoteError?.status === 401
      ) {
        return false;
      }
      throw syncRemoteError;
    }
  }, [
    realm
  ] );

  const fetchRemoteObservations = useCallback( async ( ) => {
    try {
      await syncRemoteObservations( realm, currentUserId, deletionsCompletedAt );
      return true;
    } catch ( syncRemoteError ) {
      if (
        syncRemoteError instanceof INatApiError
          && syncRemoteError?.status === 401
      ) {
        return false;
      }
      throw syncRemoteError;
    }
  }, [
    realm,
    currentUserId,
    deletionsCompletedAt
  ] );

  const syncAutomatically = useCallback( async ( ) => {
    logger.debug( "sync #1: syncing remotely deleted observations" );
    if ( loggedIn ) await fetchRemoteDeletions( );
    logger.debug( "sync #2: handling locally deleted observations" );
    await deleteLocalObservations( );
    logger.debug( "sync #3: fetching remote observations" );
    if ( loggedIn ) await fetchRemoteObservations( );
    completeSync( );
  }, [
    deleteLocalObservations,
    fetchRemoteDeletions,
    fetchRemoteObservations,
    loggedIn,
    completeSync
  ] );

  const syncManually = useCallback( async ( ) => {
    logger.debug( "sync #1: syncing remotely deleted observations" );
    if ( loggedIn ) await fetchRemoteDeletions( );
    logger.debug( "sync #2: handling locally deleted observations" );
    await deleteLocalObservations( );
    logger.debug( "sync #3: fetching remote observations" );
    if ( loggedIn ) await fetchRemoteObservations( );
    resetSyncToolbar( );
    logger.debug( "sync #4: uploading all unsynced observations" );
    if ( loggedIn ) await uploadObservations( );
    completeSync( );
  }, [
    deleteLocalObservations,
    fetchRemoteDeletions,
    fetchRemoteObservations,
    loggedIn,
    resetSyncToolbar,
    completeSync,
    uploadObservations
  ] );

  useEffect( ( ) => {
    if ( syncingStatus !== BEGIN_AUTOMATIC_SYNC ) { return; }
    setSyncingStatus( AUTOMATIC_SYNC_IN_PROGRESS );
    syncAutomatically( );
  }, [syncingStatus, syncAutomatically, setSyncingStatus] );

  useEffect( ( ) => {
    if ( syncingStatus !== BEGIN_MANUAL_SYNC ) { return; }
    setSyncingStatus( MANUAL_SYNC_IN_PROGRESS );
    syncManually( );
  }, [syncingStatus, syncManually, setSyncingStatus] );
};

export default useSyncObservations;
