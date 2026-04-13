// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "all",
};

const fetchRelationships = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    const response = await inatjs.relationships.search( { ...PARAMS, ...params }, opts );
    return response;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchRelationships", opts } } );
  }
};

const createRelationships = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    const response = await inatjs.relationships.create( { ...PARAMS, ...params }, opts );
    return response;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "createRelationships", opts } } );
  }
};

const updateRelationships = async ( params: Object = {}, opts: Object = {} ): Promise<?Object> => {
  try {
    const response = await inatjs.relationships.update( { ...PARAMS, ...params }, opts );
    return response;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "updateRelationships", opts } } );
  }
};

export {
  createRelationships,
  fetchRelationships,
  updateRelationships,
};
