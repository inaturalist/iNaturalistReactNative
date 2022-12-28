// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const createFlag = async (
  params: Object = {}
  // opts: Object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.flags.create( params );
    console.log( "create flag api call", results );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export default createFlag;
