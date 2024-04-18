// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "all"
};

const createFlag = async (
  params: object = {},
  opts: object = {}
): Promise<any> => {
  try {
    const { results } = await inatjs.flags.create( { ...PARAMS, ...params }, opts );
    return results;
  } catch ( e ) {
    return handleError( e );
  }
};

export default createFlag;
