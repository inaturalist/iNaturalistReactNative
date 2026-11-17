import type { QueryClient } from "@tanstack/react-query";
import { fetchSpeciesCounts } from "api/observations";
import type { ApiResponse } from "api/types";
import useAuthenticatedQuery, { authenticatedQueryKey } from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";

export const CURRENT_USER_SPECIES_COUNT_QUERY_KEY = "currentUserSpeciesCount";

// species_counts isn't cached on the server and is expensive for users with many observations,
// so screens share this count and will only refetch it when it's older than this value
const CURRENT_USER_SPECIES_COUNT_STALE_TIME = 5 * 60 * 1000; // 5 min

// Store a species count that was fetched some other way (e.g. as the total of My Observations'
// species list) so screens using this hook can show it without fetching it again. fetchedAt is
// when that other response was fetched; we only store it if it's newer than the count we have,
// so re-rendering an older cached response doesn't make an old count look fresh
export const setCurrentUserSpeciesCount = (
  queryClient: QueryClient,
  userId: number,
  totalResults: number,
  fetchedAt: number,
) => {
  const queryKey = authenticatedQueryKey(
    [CURRENT_USER_SPECIES_COUNT_QUERY_KEY, userId],
    { userLoggedIn: true },
  );
  const cachedUpdatedAt = queryClient.getQueryState( queryKey )?.dataUpdatedAt ?? 0;
  if ( fetchedAt <= cachedUpdatedAt ) return;

  const response: ApiResponse<object> = {
    total_results: totalResults,
    page: 1,
    per_page: 0,
    results: [],
  };
  queryClient.setQueryData( queryKey, response, { updatedAt: fetchedAt } );
};

// Call this after something in the app changes the user's observations (eg an upload or deletion).
export const markCurrentUserSpeciesCountStale = ( queryClient: QueryClient ) => {
  queryClient.invalidateQueries( {
    queryKey: [CURRENT_USER_SPECIES_COUNT_QUERY_KEY],
    refetchType: "none",
  } );
};

interface Options {
  enabled?: boolean;
}

// The signed-in user's live species count
const useCurrentUserSpeciesCount = ( { enabled = true }: Options = {} ): number | null => {
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;

  const { data } = useAuthenticatedQuery<ApiResponse<object>>(
    [CURRENT_USER_SPECIES_COUNT_QUERY_KEY, userId],
    optsWithAuth => fetchSpeciesCounts( { user_id: userId, per_page: 0, ttl: -1 }, optsWithAuth ),
    {
      enabled: enabled && !!userId,
      staleTime: CURRENT_USER_SPECIES_COUNT_STALE_TIME,
    },
  );

  return typeof data?.total_results === "number"
    ? data.total_results
    : null;
};

export default useCurrentUserSpeciesCount;
