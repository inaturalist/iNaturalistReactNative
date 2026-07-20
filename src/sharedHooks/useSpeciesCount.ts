import { fetchSpeciesCounts } from "api/observations";
import type { ApiParams, ApiResponse } from "api/types";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

export interface SpeciesCountParams extends ApiParams {
  // All four of these ids can potentially also be arrays of ids according to the API V2 docs.
  taxon_id?: number;
  user_id?: number;
  project_id?: number;
  unobserved_by_user_id?: number;
  place_id?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  verifiable?: boolean;
}

interface Options {
  enabled?: boolean;
  keyPrefix?: string;
}

const useSpeciesCount = (
  params: SpeciesCountParams,
  { enabled = true, keyPrefix = "useSpeciesCount" }: Options = {},
): number | null => {
  const countParams = { ...params, per_page: 0, ttl: -1 };

  const { data } = useAuthenticatedQuery<ApiResponse<object>>(
    [keyPrefix, countParams],
    optsWithAuth => fetchSpeciesCounts( countParams, optsWithAuth ),
    { enabled },
  );

  return typeof data?.total_results === "number"
    ? data.total_results
    : null;
};

export default useSpeciesCount;
