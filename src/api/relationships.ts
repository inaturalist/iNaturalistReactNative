import inatjs from "inaturalistjs";

import handleError from "./error";
import type { ApiOpts, ApiUntypedParams } from "./types";

const PARAMS = {
  fields: "all",
};

const fetchRelationships = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    const { results } = await inatjs.relationships.search( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "fetchRelationships", opts } },
    );
  }
};

const createRelationships = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.relationships.create( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "createRelationships", opts } },
    );
  }
};

const updateRelationships = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.relationships.update( { ...PARAMS, ...params }, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "updateRelationships", opts } },
    );
  }
};

export {
  createRelationships,
  fetchRelationships,
  updateRelationships,
};
