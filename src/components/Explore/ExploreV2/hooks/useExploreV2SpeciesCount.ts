import { fetchSpeciesCounts } from "api/observations";
import type { ApiResponse } from "api/types";
import type { ExploreV2QueryParams }
  from "components/Explore/ExploreV2/buildQueryParams";
import { useAuthenticatedQuery } from "sharedHooks";

const useExploreV2SpeciesCount = (
  queryParams: ExploreV2QueryParams,
  enabled: boolean,
): number | null => {
  const { data } = useAuthenticatedQuery<ApiResponse>(
    ["exploreV2SpeciesCount", JSON.stringify( queryParams )],
    optsWithAuth => fetchSpeciesCounts(
      { ...queryParams, per_page: 0 },
      optsWithAuth,
    ),
    { enabled },
  );

  return typeof data?.total_results === "number"
    ? data.total_results
    : null;
};

export default useExploreV2SpeciesCount;
