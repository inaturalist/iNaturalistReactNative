// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const setQualityMetric = async (
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    const response = await inatjs.observations.setQualityMetric( params, opts );
    return response.results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "setQualityMetric", opts } } );
  }
};

const deleteQualityMetric = async (
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    const { results } = await inatjs.observations.deleteQualityMetric( params, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "deleteQualityMetric", opts } } );
  }
};

const fetchQualityMetrics = async (
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    const response = await inatjs.observations.qualityMetrics( params, opts );
    return response.results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchQualityMetrics", opts } } );
  }
};

export {
  deleteQualityMetric,
  fetchQualityMetrics,
  setQualityMetric,
};
