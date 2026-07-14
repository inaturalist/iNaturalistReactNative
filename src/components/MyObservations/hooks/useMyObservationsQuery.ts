import { RealmContext } from "providers/contexts";
import { useMyObservations } from "providers/MyObservationsContext";
import { useMemo } from "react";
import { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
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

const useMyObservationsQuery = ( ): UseMyObservationsQueryResult => {
  const { state } = useMyObservations( );
  const isDefaultSort = state.observationsSort === OBSERVATIONS_SORT.DATE_UPLOADED_NEWEST;

  const localObservationIds = useLocalObservationIds( );

  const {
    observationIds: serverObservationIds,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    refetch,
  } = useServerOrderedObservations( {
    sortBy: state.observationsSort,
    enabled: !isDefaultSort,
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
    if ( isDefaultSort ) return localObservationIds;
    const unsyncedUuids = new Set( unsyncedObservationIds.map( o => o.uuid ) );
    return [
      ...unsyncedObservationIds,
      ...serverObservationIds.filter( o => !unsyncedUuids.has( o.uuid ) ),
    ];
  }, [isDefaultSort, localObservationIds, unsyncedObservationIds, serverObservationIds] );

  return {
    observationIds,
    isServerAuthoritative: !isDefaultSort,
    isLoading: isDefaultSort
      ? false
      : isLoading,
    isFetchingNextPage: isDefaultSort
      ? false
      : isFetchingNextPage,
    error: isDefaultSort
      ? null
      : error,
    // since we never fetched for default sort, we don't need to refetch or paginate.
    // pagination is still handled by useInfiniteObservationsScroll
    refetch: isDefaultSort
      ? NOOP_REFETCH
      : refetch,
    fetchNextPage: isDefaultSort
      ? NOOP_FETCH_NEXT_PAGE
      : fetchNextPage,
  };
};

export default useMyObservationsQuery;
