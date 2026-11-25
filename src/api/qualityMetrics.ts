import inatjs from "inaturalistjs";

import type { ErrorWithResponse, INatApiError } from "./error";
import handleError from "./error";
import type {
  ApiDefaultResult, ApiOpts, ApiParams, ApiResponse, ApiUntypedParams,
} from "./types";

const setQualityMetric = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const response = await inatjs.observations.setQualityMetric( params, opts );
    return response.results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "setQualityMetric", opts } },
    );
  }
};

const deleteQualityMetric = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const { results } = await inatjs.observations.deleteQualityMetric( params, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "deleteQualityMetric", opts } },
    );
  }
};

export interface QualityMetricsFetchParams extends ApiParams {
  id: string; // uuid
}

const fetchQualityMetrics = async <T = ApiDefaultResult>(
  params: QualityMetricsFetchParams,
  opts: ApiOpts = {},
): Promise<ApiResponse<T>["results"] | null | ErrorWithResponse | INatApiError> => {
  try {
    const response = await inatjs.observations.qualityMetrics( params, opts );
    return response.results;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchQualityMetrics", opts } },
    );
  }
};

export {
  deleteQualityMetric,
  fetchQualityMetrics,
  setQualityMetric,
};
