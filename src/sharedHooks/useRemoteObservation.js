// @flow
import { fetchRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts.ts";
import { useCallback, useEffect, useMemo } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

export const fetchRemoteObservationKey = "fetchRemoteObservation";

const filterHiddenContent = observation => {
  if ( observation === undefined ) {
    return observation;
  }
  const filteredObservation = observation;

  filteredObservation.comments = filteredObservation.comments.filter( comment => !comment.hidden );
  filteredObservation.identifications = filteredObservation.identifications
    .filter( identification => !identification.hidden );

  return filteredObservation;
};

const useRemoteObservation = ( uuid: string, enabled: boolean ): Object => {
  const fetchRemoteObservationQueryKey = useMemo(
    ( ) => ( [fetchRemoteObservationKey, uuid] ),
    [uuid]
  );

  const currentUser = useCurrentUser( );
  const realm = useRealm( );

  const {
    data: remoteObservation,
    refetch: refetchRemoteObservation,
    isRefetching,
    error: fetchRemoteObservationError
  } = useAuthenticatedQuery(
    fetchRemoteObservationQueryKey,
    optsWithAuth => fetchRemoteObservation(
      uuid,
      {
        include_new_projects: true,
        fields: Observation.FIELDS
      },
      optsWithAuth
    ),
    {
      enabled: !!( enabled && !!uuid && uuid.length > 0 )
    }
  );

  const needsLocalUpdate = remoteObservation
    && currentUser
    && remoteObservation?.user?.id === currentUser.id;

  const updateLocalObservation = useCallback( ( ) => {
    Observation.upsertRemoteObservations(
      [remoteObservation],
      realm
    );
  }, [remoteObservation, realm] );

  // Update local copy of a user's own observation
  useEffect( ( ) => {
    if ( needsLocalUpdate ) {
      updateLocalObservation( );
    }
  }, [
    needsLocalUpdate,
    updateLocalObservation
  ] );

  return {
    remoteObservation: filterHiddenContent( remoteObservation ),
    refetchRemoteObservation,
    isRefetching,
    fetchRemoteObservationError
  };
};

export default useRemoteObservation;
