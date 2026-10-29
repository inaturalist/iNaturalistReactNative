import { fetchSpeciesCounts } from "api/observations";
import type { ApiResponse } from "api/types";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";

export const CURRENT_USER_SPECIES_COUNT_QUERY_KEY = "currentUserSpeciesCount";

// species_counts isn't cached on the server and is expensive for users with many observations,
// so screens share this count and will only refetch it when it's older than this value
const CURRENT_USER_SPECIES_COUNT_STALE_TIME = 5 * 60 * 1000; // 5 min

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
