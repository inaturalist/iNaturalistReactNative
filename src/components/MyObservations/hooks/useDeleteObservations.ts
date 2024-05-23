import { useNavigation } from "@react-navigation/native";
import { deleteRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect, useReducer } from "react";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedMutation } from "sharedHooks";

import filterLocalObservationsToDelete from "../helpers/filterLocalObservationsToDelete";
import syncRemoteDeletedObservations from "../helpers/syncRemoteDeletedObservations";

const logger = log.extend( "useDeleteObservations" );

const { useRealm } = RealmContext;

export const INITIAL_DELETION_STATE = {
  currentDeleteCount: 1,
  deletions: [],
  deletionsComplete: false,
  deletionsCompletedAt: null,
  deletionsInProgress: false,
  error: null
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
        deletionsComplete: true,
        deletionsCompletedAt: new Date( )
      };
    case "RESET_STATE":
      return INITIAL_DELETION_STATE;
    default:
      return state;
  }
};

const useDeleteObservations = ( canBeginDeletions, myObservationsDispatch ): Object => {
  const realm = useRealm( );
  const [state, dispatch] = useReducer( deletionReducer, INITIAL_DELETION_STATE );
  const navigation = useNavigation( );

  const {
    currentDeleteCount,
    deletions,
    deletionsInProgress,
    deletionsComplete,
    error
  } = state;

  const observationToDelete = deletions[currentDeleteCount - 1];
  const uuid = observationToDelete?.uuid;

  const canStartDeletingLocalObservations = deletions.length > 0
    && !deletionsInProgress
    && !deletionsComplete;

  const deleteLocalObservation = useCallback( ( ) => {
    const realmObservation = realm?.objectForPrimaryKey( "Observation", uuid );
    logger.info( "Local observation to delete: ", realmObservation?.uuid );
    if ( realmObservation ) {
      safeRealmWrite( realm, ( ) => {
        realm?.delete( realmObservation );
      }, `deleting local observation ${realmObservation.uuid} in useDeleteObservations` );
      logger.info( "Local observation deleted" );
    }
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
      dispatch( { type: "SET_DELETE_ERROR", error: message } );
      return false;
    }
  }, [deleteObservation] );

  useEffect( ( ) => {
    const beginDeletions = async ( ) => {
      logger.info( "syncing remotely deleted observations" );
      await syncRemoteDeletedObservations( realm );
      logger.info( "syncing locally deleted observations" );
      const localObservations = filterLocalObservationsToDelete( realm );
      if ( localObservations.length > 0 && deletions.length === 0 ) {
        dispatch( {
          type: "SET_DELETIONS",
          deletions: localObservations
        } );
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
    realm
  ] );

  useEffect( ( ) => {
    if ( canStartDeletingLocalObservations ) {
      deletions.forEach( async ( observation, i ) => {
        await deleteRemoteObservationAndCatchError( );
        if ( i > 0 ) {
          dispatch( { type: "START_NEXT_DELETION" } );
        }
        if ( i === deletions.length - 1 ) {
          dispatch( { type: "DELETIONS_COMPLETE" } );
        }
      } );
    }
  }, [deletions, deleteRemoteObservationAndCatchError, canStartDeletingLocalObservations] );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        dispatch( { type: "RESET_STATE" } );
      } );
    },
    [navigation]
  );

  useEffect( () => {
    let timer;
    if ( deletionsComplete && !error ) {
      timer = setTimeout( () => {
        dispatch( { type: "RESET_STATE" } );
      }, 5000 );
    }
    return () => {
      clearTimeout( timer );
    };
  }, [deletionsComplete, error] );

  return state;
};

export default useDeleteObservations;
