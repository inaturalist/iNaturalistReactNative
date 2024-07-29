import {
  useNetInfo
} from "@react-native-community/netinfo";
import { INatApiError } from "api/error";
import { deleteRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedMutation } from "sharedHooks";
import {
  AUTOMATIC_SYNC_IN_PROGRESS,
  BEGIN_AUTOMATIC_SYNC,
  BEGIN_MANUAL_SYNC,
  MANUAL_SYNC_IN_PROGRESS
} from "stores/createSyncObservationsSlice.ts";
import useStore from "stores/useStore";

import syncRemoteDeletedObservations from "../helpers/syncRemoteDeletedObservations";
import syncRemoteObservations from "../helpers/syncRemoteObservations";

const { useRealm } = RealmContext;

const useSyncObservations = ( currentUserId, uploadObservations ): Object => {
  const { isConnected } = useNetInfo( );
  const loggedIn = !!currentUserId;
  const deleteQueue = useStore( state => state.deleteQueue );
  const deletionsCompletedAt = useStore( state => state.deletionsCompletedAt );
  const completeLocalDeletions = useStore( state => state.completeLocalDeletions );
  const startNextDeletion = useStore( state => state.startNextDeletion );
  const setDeletionError = useStore( state => state.setDeletionError );
  const syncingStatus = useStore( state => state.syncingStatus );
  const setSyncingStatus = useStore( state => state.setSyncingStatus );
  const completeSync = useStore( state => state.completeSync );
  const resetSyncToolbar = useStore( state => state.resetSyncToolbar );
  const removeFromDeleteQueue = useStore( state => state.removeFromDeleteQueue );

  const canSync = loggedIn && isConnected;

  const realm = useRealm( );

  const deleteRealmObservation = useCallback( async uuid => {
    await Observation.deleteLocalObservation( realm, uuid );
  }, [realm] );

  const handleRemoteDeletion = useAuthenticatedMutation(
    ( params, optsWithAuth ) => deleteRemoteObservation( params, optsWithAuth ),
    {
      onSuccess: ( ) => console.log( "Remote observation deleted" ),
      onError: deleteObservationError => {
        setDeletionError( deleteObservationError?.message );
        throw deleteObservationError;
      }
    }
  );

  const deleteLocalObservations = useCallback( async ( ) => {
    if ( deleteQueue.length === 0 ) { return; }

    deleteQueue.forEach( async ( uuid, i ) => {
      const observation = realm.objectForPrimaryKey( "Observation", uuid );
      const hasBeenSyncedRemotely = observation?._synced_at;

      if ( !hasBeenSyncedRemotely ) {
        return deleteRealmObservation( uuid );
      }
      if ( !canSync ) {
        // TODO: do we want to let user know their deletions can't happen
        // when they're offline or logged out?
        return null;
      }

      await handleRemoteDeletion.mutate( { uuid } );
      removeFromDeleteQueue( );

      if ( i > 0 ) {
        // this loop isn't really being used, since a user can only delete one
        // observation at a time in soft launch
        startNextDeletion( );
      }
      if ( i === deleteQueue.length - 1 ) {
        completeLocalDeletions( );
      }
      return null;
    } );
  }, [
    canSync,
    completeLocalDeletions,
    deleteQueue,
    deleteRealmObservation,
    handleRemoteDeletion,
    realm,
    removeFromDeleteQueue,
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
    if ( canSync ) {
      await fetchRemoteDeletions( );
    }
    await deleteLocalObservations( );
    if ( canSync ) {
      await fetchRemoteObservations( );
    }
    completeSync( );
  }, [
    canSync,
    deleteLocalObservations,
    fetchRemoteDeletions,
    fetchRemoteObservations,
    completeSync
  ] );

  const syncManually = useCallback( async ( ) => {
    if ( canSync ) {
      await fetchRemoteDeletions( );
    }
    await deleteLocalObservations( );
    if ( canSync ) {
      await fetchRemoteObservations( );
    }
    resetSyncToolbar( );
    // we want to show user error messages if upload fails from user
    // being offline, so we're not checking internet connectivity here
    if ( loggedIn ) {
      await uploadObservations( );
    }
    completeSync( );
  }, [
    canSync,
    completeSync,
    deleteLocalObservations,
    fetchRemoteDeletions,
    fetchRemoteObservations,
    loggedIn,
    resetSyncToolbar,
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
