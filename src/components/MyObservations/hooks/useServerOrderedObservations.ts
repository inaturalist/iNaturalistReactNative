import { searchObservations } from "api/observations";
import { useMemo } from "react";
import Observation from "realmModels/Observation";
import type { OBSERVATIONS_SORT } from "sharedHelpers/observationsSort";
import { observationSortToApiParams } from "sharedHelpers/observationsSort";
import { useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

const PER_PAGE = 20;

interface SearchObservationsResult {
  uuid: string;
  [key: string]: unknown;
}

interface SearchObservationsResponse {
  results: SearchObservationsResult[];
  total_results: number;
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
  } = useAuthenticatedQuery<SearchObservationsResponse>(
    queryKey,
    optsWithAuth => searchObservations( params, optsWithAuth ),
    { enabled: enabled && !!currentUser },
  );

  const observationIds = useMemo(
    ( ) => ( data?.results || [] ).map( ( { uuid } ) => ( { uuid } ) ),
    [data?.results],
  );

  return {
    observationIds,
    isLoading,
    error,
    totalResults: data?.total_results,
    refetch,
  };
};

export default useServerOrderedObservations;
