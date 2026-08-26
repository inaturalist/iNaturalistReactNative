import type { ApiUserCount } from "api/observationsTyped";
import { fetchIdentifiers, fetchObservers } from "api/observationsTyped";
import type { ApiResponse } from "api/types";
import type {
  ExploreV2BaseQueryParams,
} from "components/Explore/ExploreV2/helpers/buildQueryParams";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

interface Options {
  enabled?: boolean;
}

interface UserTabCounts {
  observersCount: number | null;
  identifiersCount: number | null;
}

const useUserTabCounts = (
  params: ExploreV2BaseQueryParams,
  { enabled = true }: Options = {},
): UserTabCounts => {
  const countParams = { ...params, per_page: 0, ttl: -1 };

  const { data: observersData } = useAuthenticatedQuery<ApiResponse<ApiUserCount> | null>(
    ["exploreV2ObserversCount", countParams],
    optsWithAuth => fetchObservers( countParams, optsWithAuth ),
    { enabled },
  );

  const { data: identifiersData } = useAuthenticatedQuery<ApiResponse<ApiUserCount> | null>(
    ["exploreV2IdentifiersCount", countParams],
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
