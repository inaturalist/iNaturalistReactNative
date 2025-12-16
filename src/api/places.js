// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const fetchPlace = async (
  id: number | Array<number>,
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    const { results } = await inatjs.places.fetch( id, params, opts );
    return results && results.length > 0
      ? results[0]
      : null;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchPlace", id, opts } } );
  }
};

export default fetchPlace;
