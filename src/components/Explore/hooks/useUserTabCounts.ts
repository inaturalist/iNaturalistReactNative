import type { ApiIdentifierCount, ApiObserverCount } from "api/observations";
import { fetchIdentifiers, fetchObservers } from "api/observations";
import type { ApiResponse } from "api/types";
import type {
  ExploreBaseQueryParams,
} from "components/Explore/helpers/buildQueryParams";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

interface Options {
  enabled?: boolean;
}

interface UserTabCounts {
  observersCount: number | null;
  identifiersCount: number | null;
}

const useUserTabCounts = (
  params: ExploreBaseQueryParams,
  { enabled = true }: Options = {},
): UserTabCounts => {
  const countParams = { ...params, per_page: 0, ttl: -1 };

  const { data: observersData } = useAuthenticatedQuery<ApiResponse<ApiObserverCount> | null>(
    ["exploreObserversCount", countParams],
    optsWithAuth => fetchObservers( countParams, optsWithAuth ),
    { enabled },
  );

  const { data: identifiersData } = useAuthenticatedQuery<ApiResponse<ApiIdentifierCount> | null>(
    ["exploreIdentifiersCount", countParams],
    optsWithAuth => fetchIdentifiers( countParams, optsWithAuth ),
    { enabled },
  );

  return {
    observersCount: typeof observersData?.total_results === "number"
      ? observersData.total_results
      : null,
    identifiersCount: typeof identifiersData?.total_results === "number"
      ? identifiersData.total_results
      : null,
  };
};

export default useUserTabCounts;
