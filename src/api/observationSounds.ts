import inatjs from "inaturalistjs";

import type { ErrorWithResponse } from "./error";
import handleError from "./error";
import type { ApiOpts, ApiUntypedParams } from "./types";

const deleteRemoteObservationSound = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return await inatjs.observation_sounds.delete( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "deleteRemoteObservationSound", opts } },
    );
  }
};

export default deleteRemoteObservationSound;
