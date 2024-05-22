import { useNavigation } from "@react-navigation/native";
import { deleteRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import {
  useCallback, useEffect, useReducer, useState
} from "react";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedMutation } from "sharedHooks";

import filterLocalObservationsToDelete from "../helpers/filterLocalObservationsToDelete";
import syncRemoteDeletedObservations from "../helpers/syncRemoteDeletedObservations";

const logger = log.extend( "useDeleteObservations" );

const { useRealm } = RealmContext;

export const INITIAL_DELETION_STATE = {
  currentDeleteCount: 1,
  deletionsComplete: false,
  deletionsCompletedAt: null,
  deletionsInProgress: false,
  error: null,
  observationToDelete: {},
  totalDeletions: 0
};

const deletionReducer = ( state: Object, action: Function ): Object => {
  switch ( action.type ) {
    case "DELETIONS_COMPLETE":
      return {
        ...state,
        deletionsInProgress: false,
        deletionsComplete: true,
        deletionsCompletedAt: new Date( )
      };
    case "SET_DELETE_ERROR":
      return {
        ...state,
        error: action.error,
        deletionsInProgress: false
      };
    case "SET_TOTAL_DELETIONS":
      return {
        ...state,
        totalDeletions: action.totalDeletions,
        deletionsInProgress: true
      };
    case "START_NEXT_DELETION":
      return {
        ...state,
        currentDeleteCount: state.currentDeleteCount + 1,
        observationToDelete: action.observationToDelete
      };
    case "RESET_STATE":
      return INITIAL_DELETION_STATE;
    default:
      return state;
  }
};

const useDeleteObservations = ( ): Object => {
  const [initialRender, setInitialRender] = useState( true );
  const realm = useRealm( );
  const [state, dispatch] = useReducer( deletionReducer, INITIAL_DELETION_STATE );
  const navigation = useNavigation( );

  const {
    deletionsComplete,
    error,
    observationToDelete,
    totalDeletions
  } = state;

  const { uuid } = observationToDelete;

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

  const deleteRemotelyAndCatchError = useCallback( async observation => {
    try {
      dispatch( { type: "START_NEXT_DELETION", observationToDelete: observation } );
      if ( !observationToDelete?._synced_at ) {
        return deleteLocalObservation( );
      }
      logger.info( "Remote observation to delete: ", uuid );
      return deleteObservationMutation.mutate( { uuid } );
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
  }, [deleteLocalObservation, deleteObservationMutation, observationToDelete, uuid] );

  const beginLocalDeletions = useCallback( deletions => {
    console.log( deletions, "deletions" );
    deletions.forEach( async ( observation, i ) => {
      if ( i === totalDeletions ) {
        dispatch( { type: "DELETIONS_COMPLETE" } );
      } else {
        await deleteRemotelyAndCatchError( observation );
      }
    } );
  }, [deleteRemotelyAndCatchError, totalDeletions] );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        dispatch( { type: "RESET_STATE" } );
      } );
    },
    [navigation]
  );

  useEffect( ( ) => {
    const beginDeletions = async ( ) => {
      logger.info( "syncing remotely deleted observations" );
      await syncRemoteDeletedObservations( realm );
      const deletions = filterLocalObservationsToDelete( realm );
      if ( deletions.length > 0 ) {
        dispatch( { type: "SET_TOTAL_DELETIONS", totalDeletions: deletions.length } );
        beginLocalDeletions( deletions );
      }
    };
    if ( initialRender ) {
      setInitialRender( false );
      beginDeletions( );
    }
  }, [
    beginLocalDeletions,
    initialRender,
    setInitialRender,
    realm
  ] );

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
