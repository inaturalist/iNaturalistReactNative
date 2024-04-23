// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const PARAMS = {
  fields: "display_name"
};

const fetchPlace = async (
  id: number,
  params: Object = {},
  opts: Object = {}
): Promise<?Object> => {
  try {
    const { results } = await inatjs.places.fetch( id, { ...PARAMS, ...params, ...opts } );
    return results[0];
  } catch ( e ) {
    return handleError( e );
  }
};

export default fetchPlace;
