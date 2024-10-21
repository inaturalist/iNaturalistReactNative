// @flow

import {
  WarningSheet
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useCallback } from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

type Props = {
  currentObservation: Object,
  onPressClose: Function,
  navToObsList: Function,
  observations: Array<Object>,
  updateObservations: Function
}

const DeleteObservationSheet = ( {
  currentObservation,
  onPressClose,
  navToObsList,
  observations,
  updateObservations
}: Props ): Node => {
  const { t } = useTranslation( );
  const realm = useRealm( );
  const { uuid } = currentObservation;
  const addToDeleteQueue = useStore( state => state.addToDeleteQueue );

  const multipleObservations = observations.length > 1;

  const addObservationToDeletionQueue = useCallback( ( ) => {
    const localObsToDelete = realm.objectForPrimaryKey( "Observation", uuid );
    if ( localObsToDelete ) {
      safeRealmWrite( realm, ( ) => {
        localObsToDelete._deleted_at = new Date( );
      }, "adding _deleted_at date in DeleteObservationSheet" );
      addToDeleteQueue( uuid );
    }
    if ( multipleObservations ) {
      updateObservations( observations.filter( o => o.uuid !== uuid ) );
      onPressClose( );
      return;
    }
    navToObsList( );
  }, [
    onPressClose,
    multipleObservations,
    navToObsList,
    observations,
    realm,
    addToDeleteQueue,
    updateObservations,
    uuid
  ] );

  return (
    <WarningSheet
      onPressClose={onPressClose}
      headerText={t( "DELETE-OBSERVATION--question" )}
      handleSecondButtonPress={onPressClose}
      secondButtonText={t( "CANCEL" )}
      confirm={addObservationToDeletionQueue}
      buttonText={t( "DELETE" )}
    />
  );
};

export default DeleteObservationSheet;
