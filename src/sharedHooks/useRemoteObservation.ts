import { fetchRemoteObservation } from "api/observations";
import type { ApiObservation } from "api/types";
import i18n from "i18next";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect, useMemo } from "react";
import Observation from "realmModels/Observation";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

export const fetchRemoteObservationKey = "fetchRemoteObservation";

interface UseRemoteObservationReturn {
  remoteObservation: ApiObservation | null | undefined;
  refetchRemoteObservation: () => void;
  isRefetching: boolean;
  fetchRemoteObservationError: Error | null;
}

const filterHiddenContent
= ( observation?: ApiObservation | null ): ApiObservation | null | undefined => {
  if ( observation === undefined || observation === null ) {
    return observation;
  }
  const filteredObservation = observation;

  filteredObservation.comments = filteredObservation?.comments
    ?.filter( comment => !comment.hidden ) || [];
  filteredObservation.identifications = filteredObservation?.identifications
    ?.filter( identification => !identification.hidden ) || [];

  return filteredObservation;
};

const useRemoteObservation = ( uuid: string, enabled: boolean ): UseRemoteObservationReturn => {
  const fetchRemoteObservationQueryKey = useMemo(
    ( ) => ( [fetchRemoteObservationKey, uuid] ),
    [uuid]
  );

  const currentUser = useCurrentUser( );
  const realm = useRealm( );

  const locale = i18n?.language ?? "en";

  const {
    data: remoteObservation,
    refetch: refetchRemoteObservation,
    isRefetching,
    error: fetchRemoteObservationError
  } = useAuthenticatedQuery<ApiObservation | null>(
    fetchRemoteObservationQueryKey,
    optsWithAuth => fetchRemoteObservation(
      uuid,
      {
        include_new_projects: true,
        ...( !currentUser && { locale } ),
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
