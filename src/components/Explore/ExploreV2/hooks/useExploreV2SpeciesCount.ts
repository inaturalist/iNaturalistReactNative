import { fetchSpeciesCounts } from "api/observations";
import type { ApiResponse } from "api/types";
import type { ExploreV2QueryParams }
  from "components/Explore/ExploreV2/buildQueryParams";
import { useAuthenticatedQuery } from "sharedHooks";

const useExploreV2SpeciesCount = (
  queryParams: ExploreV2QueryParams,
  enabled: boolean,
): number | null => {
  // take out some params that can be used for fetching obs but not species count
  const {
    order_by: orderBy, order, per_page: perPage, ...filterParams
  } = queryParams;
  const speciesCountParams = { ...filterParams, per_page: 0 };

  const { data } = useAuthenticatedQuery<ApiResponse>(
    ["exploreV2SpeciesCount", speciesCountParams],
    optsWithAuth => fetchSpeciesCounts( speciesCountParams, optsWithAuth ),
    { enabled },
  );

  return typeof data?.total_results === "number"
    ? data.total_results
    : null;
};

export default useExploreV2SpeciesCount;
