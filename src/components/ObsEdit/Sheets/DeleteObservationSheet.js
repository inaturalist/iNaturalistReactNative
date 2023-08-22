// @flow

import { useQueryClient } from "@tanstack/react-query";
import { deleteObservation } from "api/observations";
import {
  WarningSheet
} from "components/SharedComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

type Props = {
  handleClose: Function,
  navToObsList: Function
}

const DeleteObservationSheet = ( {
  handleClose,
  navToObsList
}: Props ): Node => {
  const {
    deleteLocalObservation,
    currentObservation,
    observations
  } = useContext( ObsEditContext );
  const queryClient = useQueryClient( );
  const { uuid } = currentObservation;

  const multipleObservations = observations.length > 1;

  const handleLocalDeletion = ( ) => {
    deleteLocalObservation( uuid );
    handleClose( );
    navToObsList( );
  };

  const deleteObservationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => deleteObservation( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        handleLocalDeletion( );
        queryClient.invalidateQueries( { queryKey: ["searchObservations"] } );
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
