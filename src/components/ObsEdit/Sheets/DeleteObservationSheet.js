// @flow

import {
  WarningSheet
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback } from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

type Props = {
  currentObservation: Object,
  handleClose: Function,
  navToObsList: Function,
  observations: Array<Object>,
  updateObservations: Function
}

const DeleteObservationSheet = ( {
  currentObservation,
  handleClose,
  navToObsList,
  observations,
  updateObservations
}: Props ): Node => {
  const { t } = useTranslation( );
  const realm = useRealm( );
  const { uuid } = currentObservation;
  const setDeletions = useStore( state => state.setDeletions );

  const multipleObservations = observations.length > 1;

  const addObservationToDeletionQueue = useCallback( ( ) => {
    const localObsToDelete = realm.objectForPrimaryKey( "Observation", uuid );
    if ( localObsToDelete ) {
      safeRealmWrite( realm, ( ) => {
        localObsToDelete._deleted_at = new Date( );
      }, "adding _deleted_at date in DeleteObservationSheet" );
      const deletion = realm.objectForPrimaryKey( "Observation", uuid );
      setDeletions( [deletion] );
    }
    if ( multipleObservations ) {
      updateObservations( observations.filter( o => o.uuid !== uuid ) );
      handleClose( );
      return;
    }
    navToObsList( );
  }, [
    handleClose,
    multipleObservations,
    navToObsList,
    observations,
    realm,
    setDeletions,
    updateObservations,
    uuid
  ] );

  return (
    <WarningSheet
      handleClose={handleClose}
      headerText={t( "DELETE-OBSERVATION--question" )}
      handleSecondButtonPress={handleClose}
      secondButtonText={t( "CANCEL" )}
      confirm={addObservationToDeletionQueue}
      buttonText={t( "DELETE" )}
    />
  );
};

export default DeleteObservationSheet;
