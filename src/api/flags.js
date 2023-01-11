// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "all"
};

const createFlag = async (
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.flags.create( { ...PARAMS, ...params }, opts );
    console.log( "create flag api call finished", results );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export default createFlag;
