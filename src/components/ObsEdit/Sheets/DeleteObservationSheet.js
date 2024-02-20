// @flow

import {
  WarningSheet
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback } from "react";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useTranslation } from "sharedHooks";

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

  const multipleObservations = observations.length > 1;

  const addObservationToDeletionQueue = useCallback( ( ) => {
    const localObsToDelete = realm.objectForPrimaryKey( "Observation", uuid );
    if ( !localObsToDelete ) {
      logger.info(
        "Observation to delete is not saved in realm; returning to MyObservations"
      );
      navToObsList( );
    } else {
      logger.info( "Observation to add to deletion queue: ", localObsToDelete.uuid );
      safeRealmWrite( realm, ( ) => {
        localObsToDelete._deleted_at = new Date( );
      }, "adding _deleted_at date in DeleteObservationSheet" );
      logger.info(
        "Observation added to deletion queue; returning to MyObservations"
      );
      navToObsList( );
    }
  }, [uuid, realm, navToObsList] );

  return (
    <WarningSheet
      handleClose={handleClose}
      headerText={multipleObservations
        ? t( "DELETE-X-OBSERVATIONS", { count: observations.length } )
        : t( "DELETE-OBSERVATION" )}
      handleSecondButtonPress={handleClose}
      secondButtonText={t( "CANCEL" )}
      confirm={addObservationToDeletionQueue}
      buttonText={multipleObservations
        ? t( "DELETE-ALL" )
        : t( "DELETE" )}
    />
  );
};

export default DeleteObservationSheet;
