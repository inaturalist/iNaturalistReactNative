// @flow
import { fetchRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect, useMemo } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

export const fetchRemoteObservationKey = "fetchRemoteObservation";

const useRemoteObservation = ( uuid: string, enabled: boolean ): any => {
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
        fields: Observation.FIELDS
      },
      optsWithAuth
    ),
    {
      enabled
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
    remoteObservation,
    refetchRemoteObservation,
    isRefetching,
    fetchRemoteObservationError
  };
};

export default useRemoteObservation;
