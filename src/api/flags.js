// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "all"
};

const createFlag = async (
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    const { results } = await inatjs.flags.create( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "createFlag", opts } } );
  }
};

export default createFlag;
