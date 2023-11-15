// @flow

import { deleteObservation } from "api/observations";
import {
  WarningSheet
} from "components/SharedComponents";
import { t } from "i18next";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useContext } from "react";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

const { useRealm } = RealmContext;

type Props = {
  handleClose: Function,
  navToObsList: Function
}

const DeleteObservationSheet = ( {
  handleClose,
  navToObsList
}: Props ): Node => {
  const realm = useRealm( );
  const {
    currentObservation,
    observations
  } = useContext( ObsEditContext );
  const { uuid } = currentObservation;

  const multipleObservations = observations.length > 1;

  const handleLocalDeletion = useCallback( ( ) => {
    const localObsToDelete = realm.objectForPrimaryKey( "Observation", uuid );
    if ( !localObsToDelete ) { return; }
    realm?.write( ( ) => {
      realm?.delete( localObsToDelete );
    } );
    handleClose( );
    navToObsList( );
  }, [uuid, realm, handleClose, navToObsList] );

  const deleteObservationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => deleteObservation( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        handleLocalDeletion( );
        // We do not invalidate the searchObservations query here because it would fetch
        // observations from the server and potentially do so before the refresh period
        // on elasticsearch for observations.search has passed and so retrieve the
        // observation "pending deletion" again.
      }
    }
  );

  return (
    <WarningSheet
      handleClose={handleClose}
      headerText={multipleObservations
        ? t( "DELETE-X-OBSERVATIONS", { count: observations.length } )
        : t( "DELETE-OBSERVATION" )}
      snapPoints={[148]}
      handleSecondButtonPress={handleClose}
      secondButtonText={t( "CANCEL" )}
      confirm={( ) => {
        if ( multipleObservations && !currentObservation?._created_at ) {
          // observations are not yet persisted to realm if user
          // is viewing multiple observations screen
          // or adding new evidence,
          // so we can simply navigate away before saving
          handleClose( );
          navToObsList( );
        } else if ( !currentObservation?._synced_at ) {
          handleLocalDeletion( );
        } else {
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
