// @flow

import { deleteObservation } from "api/observations";
import {
  WarningSheet
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback } from "react";
import { useAuthenticatedMutation, useTranslation } from "sharedHooks";

import { log } from "../../../../react-native-logs.config";

const { useRealm } = RealmContext;

const logger = log.extend( "DeleteObservationSheet" );

type Props = {
  handleClose: Function,
  navToObsList: Function,
  currentObservation: Object,
  observations: Array<Object>
}

const DeleteObservationSheet = ( {
  handleClose,
  navToObsList,
  currentObservation,
  observations
}: Props ): Node => {
  const { t } = useTranslation( );
  const realm = useRealm( );
  const { uuid } = currentObservation;

  const localObsToDelete = realm.objectForPrimaryKey( "Observation", uuid );

  const multipleObservations = observations.length > 1;

  const deleteLocalObservation = useCallback( ( ) => {
    logger.info( "Local observation to delete: ", localObsToDelete.uuid );
    realm?.write( ( ) => {
      realm?.delete( localObsToDelete );
    } );
    logger.info(
      "Local observation deleted successfully, now returning to MyObservations"
    );
    navToObsList( );
  }, [localObsToDelete, realm, navToObsList] );

  const deleteObservationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => deleteObservation( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        logger.info(
          "Remote observation deleted successfully, now deleting local observation"
        );
        deleteLocalObservation( );
        // We do not invalidate the searchObservations query here because it would fetch
        // observations from the server and potentially do so before the refresh period
        // on elasticsearch for observations.search has passed and so retrieve the
        // observation "pending deletion" again.
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

  return (
    <WarningSheet
      handleClose={handleClose}
      headerText={multipleObservations
        ? t( "DELETE-X-OBSERVATIONS", { count: observations.length } )
        : t( "DELETE-OBSERVATION" )}
      handleSecondButtonPress={handleClose}
      secondButtonText={t( "CANCEL" )}
      confirm={( ) => {
        if ( !localObsToDelete ) {
          logger.info(
            "Returning to MyObs because user is trying to delete an unsaved observation"
          );
          navToObsList( );
        } else if ( !localObsToDelete?._synced_at ) {
          logger.info(
            "Deleting locally saved observation"
          );
          deleteLocalObservation( );
        } else {
          logger.info(
            "Deleting remote observation"
          );
          deleteObservationMutation.mutate( { uuid } );
        }
      }}
      buttonText={multipleObservations
        ? t( "DELETE-ALL" )
        : t( "DELETE" )}
    />
  );
};

export default DeleteObservationSheet;
