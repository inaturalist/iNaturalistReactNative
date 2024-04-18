// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const setQualityMetric = async (
  params: object = {},
  opts: object = {}
): Promise<any> => {
  try {
    const response = await inatjs.observations.setQualityMetric( params, opts );
    return response.results;
  } catch ( e ) {
    return handleError( e );
  }
};

const deleteQualityMetric = async (
  params: object = {},
  opts: object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.observations.deleteQualityMetric( params, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchQualityMetrics = async (
  params: object = {},
  opts: object = {}
): Promise<any> => {
  try {
    const response = await inatjs.observations.qualityMetrics( params, opts );
    return response.results;
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  deleteQualityMetric,
  fetchQualityMetrics,
  setQualityMetric
};
