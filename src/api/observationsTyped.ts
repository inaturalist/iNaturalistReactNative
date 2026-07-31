import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import type { ApiOpts, ApiParams, ApiResponse } from "api/types";
import inatjs from "inaturalistjs";

export interface IconicTaxonCountResult {
  count: number;
  taxon: { name: string } | null;
}

export interface IconicTaxaCountsParams extends ApiParams {
  user_id?: number;
}

const fetchIconicTaxaCounts = async (
  params: IconicTaxaCountsParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<IconicTaxonCountResult> | null | ErrorWithResponse | INatApiError> => {
  try {
    return await inatjs.observations.iconicTaxaCounts( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchIconicTaxaCounts", opts } },
    );
  }
};

export default fetchIconicTaxaCounts;
