import inatjs from "inaturalistjs";

import handleError from "./error";
import type { ApiOpts, ApiUntypedParams } from "./types";

const setQualityMetric = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const response = await inatjs.observations.setQualityMetric( params, opts );
    return response.results;
  } catch ( e ) {
    return handleError(
      e,
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
      e,
      { context: { functionName: "deleteQualityMetric", opts } },
    );
  }
};

const fetchQualityMetrics = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const response = await inatjs.observations.qualityMetrics( params, opts );
    return response.results;
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "fetchQualityMetrics", opts } },
    );
  }
};

export {
  deleteQualityMetric,
  fetchQualityMetrics,
  setQualityMetric,
};
