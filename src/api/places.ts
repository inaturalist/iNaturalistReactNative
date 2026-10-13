import inatjs from "inaturalistjs";

import type { ErrorWithResponse } from "./error";
import handleError from "./error";
import type { ApiOpts, ApiUntypedParams } from "./types";

const fetchPlace = async (
  id: number | number[],
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const { results } = await inatjs.places.fetch( id, params, opts );
    return results && results.length > 0
      ? results[0]
      : null;
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchPlace", id, opts } },
    );
  }
};

export default fetchPlace;
