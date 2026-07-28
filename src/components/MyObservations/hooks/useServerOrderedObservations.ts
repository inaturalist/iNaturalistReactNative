import { searchObservations } from "api/observations";
import { RealmContext } from "providers/contexts";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { observationSortToApiParams } from "sharedHelpers/observationsSort";
import { useAuthenticatedInfiniteQuery, useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const logger = log.extend( "useServerOrderedObservations" );

const PER_PAGE = 20;

interface SearchObservationsResult {
  uuid: string;
  [key: string]: unknown;
}

interface SearchObservationsResponse {
  page: number;
  results: SearchObservationsResult[];
  total_results: number;
}

interface UseServerOrderedObservationsParams {
  sortBy: OBSERVATIONS_SORT;
  enabled?: boolean;
}

interface UseServerOrderedObservationsResult {
  observationIds: { uuid: string }[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  error: Error | null;
  totalResults?: number;
  fetchNextPage: ( ) => void;
  refetch: ( ) => void;
}

const useServerOrderedObservations = ( {
  sortBy,
  enabled = true,
}: UseServerOrderedObservationsParams ): UseServerOrderedObservationsResult => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const baseParams = {
    user_id: currentUser?.id,
    ...observationSortToApiParams( sortBy ),
    per_page: PER_PAGE,
    fields: Observation.ADVANCED_MODE_LIST_FIELDS,
    // Bypass API response caching so newly created/updated observations show up
    ttl: -1,
  };

  const queryKey = ["useServerOrderedObservations", baseParams];

  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    refetch,
  } = useAuthenticatedInfiniteQuery(
    queryKey,
    async ( { pageParam = 1 }, optsWithAuth ): Promise<SearchObservationsResponse> => {
      const params = {
        ...baseParams,
        page: pageParam,
      };
      const rawResponse = await searchObservations( params, optsWithAuth );
      const response = rawResponse as SearchObservationsResponse;
      const results = response.results || [];
      // upsert results to Realm
      try {
        Observation.upsertRemoteObservations( results, realm );
      } catch ( upsertError ) {
        // A local Realm-write failure shouldn't be reported as a failed search
        logger.error( "Failed to upsert server-ordered observations", upsertError );
      }
      return response;
    },
    {
      getNextPageParam: ( lastPage: SearchObservationsResponse ) => {
        if ( !lastPage ) return null;
        const totalFetchedCount = lastPage.page * PER_PAGE;
        return totalFetchedCount < lastPage.total_results
          ? lastPage.page + 1
          : null;
      },
      enabled: enabled && !!currentUser,
    },
  );

  const pages: SearchObservationsResponse[] = data?.pages || [];
  const observationIds = pages
    .flatMap( page => page.results || [] )
    .map( ( { uuid } ) => ( { uuid } ) );

  return {
    observationIds,
    isLoading,
    isFetchingNextPage,
    error,
    totalResults: pages[0]?.total_results,
    fetchNextPage,
    refetch,
  };
};

export default useServerOrderedObservations;
