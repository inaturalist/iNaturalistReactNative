import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import { ICONIC_TAXA_COUNTS_FIELDS } from "api/fields";
import type {
  ApiObservationFilterParams,
  ApiObservationsSearchParams,
  ApiOpts,
  ApiParams,
  ApiResponse,
  ApiUser,
} from "api/types";
import inatjs from "inaturalistjs";

export interface IconicTaxonCountResult {
  count: number;
  taxon: { name: string } | null;
}

// Accepts only a user_id for now, but could be widened to accept a login string or an array of
// ids or logins. This endpoint was created to assist with building the grouped-by-iconic-taxa
// view for My Observations, so for now, narrowing to number only is a deliberate simplification
// for what this feature actually needs.
export interface IconicTaxaCountsParams extends ApiParams {
  user_id?: number;
}

const fetchIconicTaxaCounts = async (
  params: IconicTaxaCountsParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<IconicTaxonCountResult> | null | ErrorWithResponse | INatApiError> => {
  try {
    return await inatjs.observations.iconicTaxaCounts(
      { fields: ICONIC_TAXA_COUNTS_FIELDS, ...params },
      opts,
    );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchIconicTaxaCounts", opts } },
    );
  }
};

export interface ApiObserverCount {
  observation_count: number;
  species_count?: number;
  user: ApiUser;
  user_id?: number;
}

export interface ApiIdentifierCount {
  count: number;
  user: ApiUser;
  user_id?: number;
}

export interface ObserverCountsParams extends ApiObservationFilterParams {
  order?: ApiObservationsSearchParams["order"];
  order_by?: "observation_count" | "species_count";
}

export interface IdentifierCountsParams extends ApiObservationFilterParams {
  order?: ApiObservationsSearchParams["order"];
  order_by?: ApiObservationsSearchParams["order_by"];
}

const fetchObservers = async (
  params: ObserverCountsParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<ApiObserverCount> | null> => {
  try {
    return await inatjs.observations.observers( params, opts );
  } catch ( e ) {
    await handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchObservers", opts } },
    );
    return null;
  }
};

const fetchIdentifiers = async (
  params: IdentifierCountsParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<ApiIdentifierCount> | null> => {
  try {
    return await inatjs.observations.identifiers( params, opts );
  } catch ( e ) {
    await handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchIdentifiers", opts } },
    );
    return null;
  }
};

export {
  fetchIdentifiers,
  fetchObservers,
};

export default fetchIconicTaxaCounts;
