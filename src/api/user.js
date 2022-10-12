// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "all"
};

const fetchUserMe = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.users.me( { ...PARAMS, ...params, ...opts } );
    return results[0];
  } catch ( e ) {
    return handleError( e );
  }
};

export default fetchUserMe;
