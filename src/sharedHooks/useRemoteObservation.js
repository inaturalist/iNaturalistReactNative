// @flow
import { fetchRemoteObservation } from "api/observations";
import { RealmContext } from "providers/contexts";
import { useEffect, useMemo } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedQuery, useCurrentUser, useIsConnected } from "sharedHooks";

const { useRealm } = RealmContext;

export const fetchRemoteObservationKey = "fetchRemoteObservation";

const useRemoteObservation = ( uuid: string, enabled: boolean ): Object => {
  const fetchRemoteObservationQueryKey = useMemo(
    ( ) => ( [fetchRemoteObservationKey, uuid] ),
    [uuid]
  );

  const currentUser = useCurrentUser( );
  const realm = useRealm( );
  const isConnected = useIsConnected( );

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
      keepPreviousData: false,
      enabled: !!isConnected && !!enabled
    }
  );

  // Update local copy of a user's own observation
  useEffect( ( ) => {
    if (
      remoteObservation
      && currentUser
      && remoteObservation?.user?.id === currentUser.id
    ) {
      Observation.upsertRemoteObservations(
        [remoteObservation],
        realm
      );
    }
  }, [
    currentUser,
    realm,
    remoteObservation
  ] );

  return {
    remoteObservation,
    refetchRemoteObservation,
    isRefetching,
    fetchRemoteObservationError
  };
};

export default useRemoteObservation;
