import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { INatApiError } from "api/error";
import { deleteRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect, useState } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedMutation } from "sharedHooks";
import {
  AUTOMATIC_SYNC_IN_PROGRESS,
  BEGIN_AUTOMATIC_SYNC,
  BEGIN_MANUAL_SYNC,
  MANUAL_SYNC_IN_PROGRESS,
} from "stores/createSyncObservationsSlice";
import useStore from "stores/useStore";

import syncRemoteDeletedObservations from "../helpers/syncRemoteDeletedObservations";
import syncRemoteObservations from "../helpers/syncRemoteObservations";

const { useRealm } = RealmContext;

const useSyncObservations = (
  currentUserId: number,
  startUploadObservations: ( _skipSomeUuids: string[] | undefined ) => void,
) => {
  const { isConnected } = useNetInfo( );
  const loggedIn = !!( currentUserId );
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
  const autoSyncAbortController = useStore( storeState => storeState.autoSyncAbortController );
  const [currentDeletionUuid, setCurrentDeletionUuid] = useState( null );

  const canSync = loggedIn && isConnected === true;

  const realm = useRealm( );

  const { deleteRemoteObservationMutateAsync } = useAuthenticatedMutation(
    ( params: object, optsWithAuth: object ) => deleteRemoteObservation( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        Observation
          .deleteLocalObservation( realm, currentDeletionUuid );
        removeFromDeleteQueue( );
      },
      onError: ( deleteObservationError: Error ) => {
        setDeletionError( deleteObservationError?.message );
        throw deleteObservationError;
      },
    },
  );

  const deleteLocalObservations = useCallback( async ( ) => {
    if ( deleteQueue.length === 0 ) { return; }

    deleteQueue.forEach( async ( uuid: string, i: number ) => {
      setCurrentDeletionUuid( uuid );
      const observation = realm.objectForPrimaryKey( "Observation", uuid );

      // Mark as pending deletion first instead of immediately deleting
      Observation.markPendingDeletion( realm, uuid );

      const hasBeenSyncedRemotely = observation?._synced_at;

      if ( !hasBeenSyncedRemotely ) {
        Observation.deleteLocalObservation( realm, uuid );
      } else {
        try {
          await deleteRemoteObservationMutateAsync( { uuid } );
        } catch ( _error ) {
          // In case of failure, clear the pending deletion flag after some time
          // to allow retrying later
          setTimeout( ( ) => {
            Observation.clearPendingDeletion( realm, uuid );
          }, 60000 );
        }
      }

      if ( i > 0 ) {
        // this loop isn't really being used, since a user can only delete one
        // observation at a time in soft launch
        startNextDeletion( );
      }
      if ( i === deleteQueue.length - 1 ) {
        await completeLocalDeletions( );
      }
      return null;
    } );
  }, [
    completeLocalDeletions,
    deleteQueue,
    deleteRemoteObservationMutateAsync,
    realm,
    startNextDeletion,
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
    realm,
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
    deletionsCompletedAt,
  ] );

  const signalAborted = autoSyncAbortController && autoSyncAbortController.signal.aborted;

  const syncAutomatically = useCallback( async ( ) => {
    if ( !signalAborted && canSync ) {
      await fetchRemoteDeletions( );
    }

    if ( !signalAborted ) {
      await deleteLocalObservations( );
    }

    // While this is redundant with the first load from
    // useInfiniteObservationsScroll on MyObs, we need it for subsequent
    // arrivals on MyObs, i.e. when data is already loaded. ~~~~kueda 20241203
    if ( !signalAborted && canSync ) {
      await fetchRemoteObservations( );
    }

    if ( !signalAborted ) {
      completeSync( );
    }
  }, [
    canSync,
    completeSync,
    deleteLocalObservations,
    fetchRemoteDeletions,
    fetchRemoteObservations,
    signalAborted,
  ] );

  interface Options {
    skipUploads?: boolean;
    // uuids of observations to skip uploading
    skipSomeUploads?: string[];
  }
  const syncManually = useCallback( async ( options: Options ) => {
    const skipUploads = options?.skipUploads || false;
    // we abort the automatic sync process when a user taps the manual sync button
    // on the toolbar, per #1730
    autoSyncAbortController?.abort();
    if ( canSync ) {
      await fetchRemoteDeletions( );
    }
    await deleteLocalObservations( );
    if ( canSync ) {
      await fetchRemoteObservations( );
    }
    resetSyncToolbar( );
    // FYI this updates the state in the sync slice to state that "syncing" is
    // complete, i.e. all the stuff except for uploading observations, even
    // though this method is called "syncManually". We could use some better
    // terminology and naming if we really want to consider those two
    // processes as separate
    completeSync( );
    // we want to show user error messages if upload fails from user
    // being offline, so we're not checking internet connectivity here
    if ( loggedIn && !skipUploads ) {
      // In theory completeSync will get called when the upload process finishes
      return startUploadObservations( options?.skipSomeUploads );
    }
    return Promise.resolve();
  }, [
    autoSyncAbortController,
    canSync,
    completeSync,
    deleteLocalObservations,
    fetchRemoteDeletions,
    fetchRemoteObservations,
    loggedIn,
    resetSyncToolbar,
    startUploadObservations,
  ] );

  useEffect( ( ) => {
    if ( syncingStatus !== BEGIN_AUTOMATIC_SYNC ) { return; }
    setSyncingStatus( AUTOMATIC_SYNC_IN_PROGRESS );
    syncAutomatically( );
  }, [syncingStatus, syncAutomatically, setSyncingStatus] );

  useEffect( ( ) => {
    if ( syncingStatus !== BEGIN_MANUAL_SYNC ) { return; }
    setSyncingStatus( MANUAL_SYNC_IN_PROGRESS );
  }, [syncingStatus, syncManually, setSyncingStatus] );

  return {
    syncManually,
  };
};

export default useSyncObservations;
