// @flow

import inatjs from "inaturalistjs";
import Identification from "realmModels/Identification";

import handleError from "./error";

const PARAMS = {
  fields: Identification.ID_FIELDS,
};

const createIdentification = async (
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    const { results } = await inatjs.identifications.create( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "createIdentification", opts } } );
  }
};

const updateIdentification = async (
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    const { results } = await inatjs.identifications.update( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "updateIdentification", opts } } );
  }
};

export {
  createIdentification,
  updateIdentification,
};
