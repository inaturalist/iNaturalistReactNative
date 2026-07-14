import { searchObservations } from "api/observations";
import { RealmContext } from "providers/contexts";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { observationSortToApiParams } from "sharedHelpers/observationsSort";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

const { useRealm } = RealmContext;

const logger = log.extend( "useServerOrderedObservations" );

const PER_PAGE = 20;

interface SearchObservationsResult {
  uuid: string;
  [key: string]: unknown;
}

interface SearchObservationsResponse {
  results: SearchObservationsResult[];
  total_results: number;
}

interface ServerOrderedObservationsData {
  observationIds: { uuid: string }[];
  totalResults: number;
}

interface UseServerOrderedObservationsParams {
  sortBy: OBSERVATIONS_SORT;
  page?: number;
  enabled?: boolean;
}

interface UseServerOrderedObservationsResult {
  observationIds: { uuid: string }[];
  isLoading: boolean;
  error: Error | null;
  totalResults?: number;
  refetch: ( ) => void;
}

const useServerOrderedObservations = ( {
  sortBy,
  page = 1,
  enabled = true,
}: UseServerOrderedObservationsParams ): UseServerOrderedObservationsResult => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  const params = {
    user_id: currentUser?.id,
    ...observationSortToApiParams( sortBy ),
    page,
    per_page: PER_PAGE,
    fields: Observation.ADVANCED_MODE_LIST_FIELDS,
    // Bypass API response caching so newly created/updated observations show up
    ttl: -1,
  };

  const queryKey = ["useServerOrderedObservations", params];

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useAuthenticatedQuery<ServerOrderedObservationsData>(
    queryKey,
    async ( optsWithAuth ): Promise<ServerOrderedObservationsData> => {
      const rawResponse = await searchObservations( params, optsWithAuth );
      const response = rawResponse as SearchObservationsResponse;
      const results = response.results || [];
      try {
        Observation.upsertRemoteObservations( results, realm );
      } catch ( upsertError ) {
        // A local Realm-write failure shouldn't be reported as a failed search
        logger.error( "Failed to upsert server-ordered observations", upsertError );
      }
      return {
        observationIds: results.map( ( { uuid } ) => ( { uuid } ) ),
        totalResults: response.total_results,
      };
    },
    { enabled: enabled && !!currentUser },
  );

  return {
    observationIds: data?.observationIds || [],
    isLoading,
    error,
    totalResults: data?.totalResults,
    refetch,
  };
};

export default useServerOrderedObservations;
