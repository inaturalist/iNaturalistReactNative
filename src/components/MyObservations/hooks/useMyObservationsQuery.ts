import { RealmContext } from "providers/contexts";
import { useMyObservations } from "providers/MyObservationsContext";
import { useMemo } from "react";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { useCurrentUser } from "sharedHooks";
import useLocalObservationIds from "sharedHooks/useLocalObservationIds";

import useServerOrderedObservations from "./useServerOrderedObservations";

const { useQuery } = RealmContext;

const NOOP_REFETCH = ( ) => undefined;
const NOOP_FETCH_NEXT_PAGE = ( ) => undefined;

interface UseMyObservationsQueryResult {
  observationIds: { uuid: string }[];
  isServerAuthoritative: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  refetch: ( ) => void;
  fetchNextPage: ( ) => void;
}

// We want to preserve offline behavior for the default sort (created at, desc) so a user can see
// and interact with their obs offline. This hook uses selected sort to determine whether Realm or
// the server should be the authoritative source of a user's observations (unsynced obs
// are always merged in at the top regardless of source).
//
// Logged-out users can never have server-ordered observations, since they can't upload until
// they log in, so a non-default sort is applied to their local observations instead.

const useMyObservationsQuery = ( ): UseMyObservationsQueryResult => {
  const { state } = useMyObservations( );
  const currentUser = useCurrentUser( );
  const isDefaultSort = state.observationsSort === OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST;
  const sortLocally = !isDefaultSort && !currentUser;
  const isServerAuthoritative = !isDefaultSort && !!currentUser;

  const localObservationIds = useLocalObservationIds(
    sortLocally
      ? state.observationsSort
      : undefined,
  );

  const {
    observationIds: serverObservationIds,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    refetch,
  } = useServerOrderedObservations( {
    sortBy: state.observationsSort,
    enabled: isServerAuthoritative,
  } );

  // if we want obs from the server, we'll want to prepend local, unsynced obs to the top
  const unsyncedObs = useQuery<{ uuid: string }>(
    {
      type: "Observation",
      query: observations => observations
        .filtered(
          "needs_sync == true AND "
          + "(_deleted_at == nil OR _pending_deletion == false OR _pending_deletion == nil)",
        )
        .sorted( "_created_at", true ),
      keyPaths: ["uuid"],
    },
    [],
  );

  const unsyncedObservationIds = useMemo(
    ( ) => unsyncedObs.map( ( { uuid } ) => ( { uuid } ) ),
    [unsyncedObs],
  );

  // dedupe in case any locally unsynced obs also exist in the server results
  const observationIds = useMemo( ( ) => {
    if ( isDefaultSort || sortLocally ) return localObservationIds;
    const unsyncedUuids = new Set( unsyncedObservationIds.map( o => o.uuid ) );
    return [
      ...unsyncedObservationIds,
      ...serverObservationIds.filter( o => !unsyncedUuids.has( o.uuid ) ),
    ];
  }, [
    isDefaultSort,
    sortLocally,
    localObservationIds,
    unsyncedObservationIds,
    serverObservationIds,
  ] );

  return {
    observationIds,
    isServerAuthoritative,
    isLoading: isServerAuthoritative
      ? isLoading
      : false,
    isFetchingNextPage: isServerAuthoritative
      ? isFetchingNextPage
      : false,
    error: isServerAuthoritative
      ? error
      : null,
    // pagination only applies to the server-authoritative case; the default sort is handled by
    // useInfiniteObservationsScroll, and locally-sorted data for logged-out users loads from Realm
    refetch: isServerAuthoritative
      ? refetch
      : NOOP_REFETCH,
    fetchNextPage: isServerAuthoritative
      ? fetchNextPage
      : NOOP_FETCH_NEXT_PAGE,
  };
};

export default useMyObservationsQuery;
