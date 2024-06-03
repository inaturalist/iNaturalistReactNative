import { useNavigation } from "@react-navigation/native";
import { INatApiError } from "api/error";
import { deleteRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect } from "react";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedMutation } from "sharedHooks";
import useStore from "stores/useStore";

import filterLocalObservationsToDelete from "../helpers/filterLocalObservationsToDelete";
import syncRemoteDeletedObservations from "../helpers/syncRemoteDeletedObservations";

const logger = log.extend( "useDeleteObservations" );

const { useRealm } = RealmContext;

const useDeleteObservations = ( canBeginDeletions, myObservationsDispatch ): Object => {
  const deletions = useStore( state => state.deletions );
  const deletionsComplete = useStore( state => state.deletionsComplete );
  const deletionsInProgress = useStore( state => state.deletionsInProgress );
  const currentDeleteCount = useStore( state => state.currentDeleteCount );
  const error = useStore( state => state.deleteError );
  const finishDeletions = useStore( state => state.finishDeletions );
  const resetDeleteObservationsSlice = useStore( state => state.resetDeleteObservationsSlice );
  const setDeletions = useStore( state => state.setDeletions );
  const startNextDeletion = useStore( state => state.startNextDeletion );
  const setDeletionError = useStore( state => state.setDeletionError );

  const realm = useRealm( );
  const navigation = useNavigation( );

  const observationToDelete = deletions[currentDeleteCount - 1];
  const uuid = observationToDelete?.uuid;

  const canStartDeletingLocalObservations = deletions.length > 0
    && !deletionsInProgress
    && !deletionsComplete;

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
      console.warn( "useDeleteObservations, deleteError: ", deleteError );
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
    const beginDeletions = async ( ) => {
      // logger.info( "syncing remotely deleted observations" );
      try {
        await syncRemoteDeletedObservations( realm );
      } catch ( syncRemoteError ) {
        // For some reason this seems to run even when signed out, in which
        // case we end up sending no JWT or the anon JWT, wich fails auth. If
        // that happens, we can just return and call it a day.
        if (
          syncRemoteError instanceof INatApiError
          && syncRemoteError?.status === 401
        ) {
          return;
        }
        throw syncRemoteError;
      }
      // logger.info( "syncing locally deleted observations" );
      const localObservations = filterLocalObservationsToDelete( realm );
      if ( localObservations.length > 0 && deletions.length === 0 ) {
        setDeletions( localObservations );
      }
    };
    if ( canBeginDeletions ) {
      myObservationsDispatch( { type: "SET_START_DELETIONS" } );
      beginDeletions( );
    }
  }, [
    canBeginDeletions,
    deletions,
    myObservationsDispatch,
    realm,
    setDeletions
  ] );

  useEffect( ( ) => {
    if ( canStartDeletingLocalObservations ) {
      deletions.forEach( async ( observation, i ) => {
        await deleteRemoteObservationAndCatchError( );
        if ( i > 0 ) {
          startNextDeletion( );
        }
        if ( i === deletions.length - 1 ) {
          finishDeletions( );
        }
      } );
    }
  }, [
    canStartDeletingLocalObservations,
    deleteRemoteObservationAndCatchError,
    deletions,
    finishDeletions,
    startNextDeletion
  ] );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        resetDeleteObservationsSlice( );
      } );
    },
    [navigation, resetDeleteObservationsSlice]
  );

  useEffect( ( ) => {
    let timer;
    if ( deletionsComplete && !error ) {
      timer = setTimeout( ( ) => {
        resetDeleteObservationsSlice( );
      }, 5000 );
    }
    return ( ) => {
      clearTimeout( timer );
    };
  }, [deletionsComplete, error, resetDeleteObservationsSlice] );

  return {
    deleteLocalObservation
  };
};

export default useDeleteObservations;
