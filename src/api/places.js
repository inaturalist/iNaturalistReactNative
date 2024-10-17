// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const fetchPlace = async (
  id: number | Array<number>,
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    return await inatjs.places.fetch( id, params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export default fetchPlace;
