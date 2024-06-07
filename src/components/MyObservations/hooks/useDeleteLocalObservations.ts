import { deleteRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect } from "react";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedMutation } from "sharedHooks";
import {
  HANDLING_LOCAL_DELETIONS
} from "stores/createDeleteAndSyncObservationsSlice.ts";
import useStore from "stores/useStore";

const logger = log.extend( "useDeleteLocalObservations" );

const { useRealm } = RealmContext;

const useDeleteLocalObservations = ( ): Object => {
  const deletions = useStore( state => state.deletions );
  const currentDeleteCount = useStore( state => state.currentDeleteCount );
  const finishLocalDeletions = useStore( state => state.finishLocalDeletions );
  const startNextDeletion = useStore( state => state.startNextDeletion );
  const setDeletionError = useStore( state => state.setDeletionError );
  const preUploadStatus = useStore( state => state.preUploadStatus );

  const realm = useRealm( );

  const observationToDelete = deletions[currentDeleteCount - 1];
  const uuid = observationToDelete?.uuid;

  const deleteLocalObservation = useCallback( async ( ) => {
    await Observation.deleteLocalObservation( realm, uuid );
    return true;
  }, [realm, uuid] );

  const deleteObservationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => deleteRemoteObservation( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        logger.info(
          "Remote observation deleted, now deleting local observation"
        );
        deleteLocalObservation( );
      },
      onError: deleteObservationError => {
        // If we tried to delete and got a 404, this observation doesn't exist
        // on the server any more and should be deleted locally
        if ( deleteObservationError?.status === 404 ) {
          deleteLocalObservation( );
        } else {
          throw deleteObservationError;
        }
      }
    }
  );

  const deleteObservation = useCallback( async ( ) => {
    if ( !observationToDelete?._synced_at ) {
      return deleteLocalObservation( );
    }
    logger.info( "Remote observation to delete: ", uuid );
    return deleteObservationMutation.mutate( { uuid } );
  }, [deleteLocalObservation, deleteObservationMutation, observationToDelete, uuid] );

  const deleteRemoteObservationAndCatchError = useCallback( async ( ) => {
    try {
      return deleteObservation( );
    } catch ( deleteError ) {
      console.warn( "useDeleteLocalObservations, deleteError: ", deleteError );
      let { message } = deleteError;
      if ( deleteError?.json?.errors ) {
        // TODO localize comma join
        message = deleteError.json.errors.map( e => {
          if ( e.message?.errors ) {
            return e.message.errors.flat( ).join( ", " );
          }
          return e.message;
        } ).join( ", " );
      } else {
        throw deleteError;
      }
      setDeletionError( message );
      return false;
    }
  }, [deleteObservation, setDeletionError] );

  useEffect( ( ) => {
    if ( preUploadStatus === HANDLING_LOCAL_DELETIONS ) {
      logger.info( "syncing locally deleted observations" );

      if ( deletions.length === 0 ) {
        finishLocalDeletions( );
        return;
      }
      deletions.forEach( async ( observation, i ) => {
        await deleteRemoteObservationAndCatchError( );
        if ( i > 0 ) {
          startNextDeletion( );
        }
        if ( i === deletions.length - 1 ) {
          finishLocalDeletions( );
        }
      } );
    }
  }, [
    deleteRemoteObservationAndCatchError,
    deletions,
    finishLocalDeletions,
    preUploadStatus,
    realm,
    startNextDeletion
  ] );

  return {
    deleteLocalObservation
  };
};

export default useDeleteLocalObservations;
