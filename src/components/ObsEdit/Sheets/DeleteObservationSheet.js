// @flow

import { useQueryClient } from "@tanstack/react-query";
import {
  adjustIconicTaxaObservationCount,
} from "components/MyObservations/hooks/useIconicTaxaObservationCounts";
import {
  WarningSheet,
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback } from "react";
import { iconicTaxaGroupForTaxonName } from "sharedHelpers/iconicTaxaGroupOrder";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useCurrentUser, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

const { useRealm } = RealmContext;

type Props = {
  currentObservation: Object,
  onPressClose: Function,
  observations: Object[],
  onDelete?: Function,
  updateObservations: Function
}

const DeleteObservationSheet = ( {
  currentObservation,
  onPressClose,
  observations,
  onDelete,
  updateObservations,
}: Props ): Node => {
  const { t } = useTranslation( );
  const realm = useRealm( );
  const queryClient = useQueryClient( );
  const currentUser = useCurrentUser( );
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
      // The small grid's header counts come from the server, which only ever counted this
      // observation if it was uploaded
      if ( localObsToDelete._synced_at ) {
        adjustIconicTaxaObservationCount(
          queryClient,
          currentUser?.id,
          iconicTaxaGroupForTaxonName( localObsToDelete.taxon?.iconic_taxon_name ),
          -1,
        );
      }
    }
    if ( multipleObservations ) {
      updateObservations( observations.filter( o => o.uuid !== uuid ) );
      onPressClose( );
      return;
    }
    if ( typeof ( onDelete ) === "function" ) {
      onDelete( );
    }
  }, [
    onPressClose,
    multipleObservations,
    observations,
    onDelete,
    realm,
    addToDeleteQueue,
    queryClient,
    currentUser?.id,
    updateObservations,
    uuid,
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
