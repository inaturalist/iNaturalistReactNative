// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const createIdentifications = async (
  params: Object = {},
  opts: Object = {}
): Promise<any> => {
  try {
    return await inatjs.identifications.create( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export default createIdentifications;
