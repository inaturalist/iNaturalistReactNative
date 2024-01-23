// @flow
import { deleteRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect, useReducer } from "react";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedMutation } from "sharedHooks";

const logger = log.extend( "useDeleteObservations" );

const { useRealm } = RealmContext;

export const INITIAL_DELETION_STATE = {
  currentDeleteCount: 1,
  error: null,
  deletionsInProgress: false,
  // $FlowIgnore
  deletions: [],
  deletionsComplete: false
};

const deletionReducer = ( state: Object, action: Function ): Object => {
  switch ( action.type ) {
    case "SET_DELETE_ERROR":
      return {
        ...state,
        error: action.error,
        deletionsInProgress: false
      };
    case "SET_DELETIONS":
      return {
        ...state,
        deletions: action.deletions
      };
    case "START_NEXT_DELETION":
      return {
        ...state,
        currentDeleteCount: state.currentDeleteCount + 1,
        deletionsInProgress: true
      };
    case "DELETIONS_COMPLETE":
      return {
        ...state,
        deletionsInProgress: false,
        deletionsComplete: true
      };
    default:
      return state;
  }
};

const useDeleteObservations = ( ): Object => {
  const realm = useRealm( );
  const [state, dispatch] = useReducer( deletionReducer, INITIAL_DELETION_STATE );

  // currently sorting so oldest observations to delete are first
  const observationsFlaggedForDeletion = realm
    .objects( "Observation" ).filtered( "_deleted_at != nil" ).sorted( "_deleted_at", false );

  const {
    currentDeleteCount,
    deletions,
    deletionsInProgress,
    deletionsComplete
  } = state;

  const observationToDelete = deletions[currentDeleteCount - 1];

  const deleteLocalObservation = useCallback( ( ) => {
    const realmObservation = realm.objectForPrimaryKey( "Observation", observationToDelete.uuid );
    logger.info( "Local observation to delete: ", realmObservation.uuid );
    realm.write( ( ) => {
      realm?.delete( realmObservation );
    } );
    logger.info( "Local observation deleted" );
    return true;
  }, [realm, observationToDelete] );

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
    logger.info( "Remote observation to delete: ", observationToDelete.uuid );
    return deleteObservationMutation.mutate( { uuid: observationToDelete.uuid } );
  }, [deleteLocalObservation, deleteObservationMutation, observationToDelete] );

  const deleteObservationAndCatchError = useCallback( async ( ) => {
    try {
      return deleteObservation( );
    } catch ( deleteError ) {
      console.warn( "useDeleteObservations, deleteError: ", deleteError );
      let { message } = deleteError;
      if ( deleteError?.json?.errors ) {
        // TODO localize comma join
        message = deleteError.json.errors.map( error => {
          if ( error.message?.errors ) {
            return error.message.errors.flat( ).join( ", " );
          }
          return error.message;
        } ).join( ", " );
      } else {
        throw deleteError;
      }
      dispatch( { type: "SET_DELETE_ERROR", error: message } );
      return false;
    }
  }, [deleteObservation] );

  useEffect( ( ) => {
    if ( observationsFlaggedForDeletion.length > 0 && deletions.length === 0 ) {
      logger.info(
        "Observations flagged for deletion: ",
        observationsFlaggedForDeletion.map( obs => obs.uuid )
      );
      dispatch( {
        type: "SET_DELETIONS",
        deletions: observationsFlaggedForDeletion.map( obs => obs.toJSON( ) )
      } );
    }
  }, [observationsFlaggedForDeletion, deletions] );

  useEffect( ( ) => {
    if ( deletions.length > 0 && !deletionsInProgress && !deletionsComplete ) {
      deletions.forEach( async ( observation, i ) => {
        await deleteObservationAndCatchError( );
        if ( i > 0 ) {
          dispatch( { type: "START_NEXT_DELETION" } );
        }
        if ( i === deletions.length - 1 ) {
          dispatch( { type: "DELETIONS_COMPLETE" } );
        }
      } );
    }
  }, [deletions, deleteObservationAndCatchError, deletionsInProgress, deletionsComplete] );

  return state;
};

export default useDeleteObservations;
