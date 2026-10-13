import inatjs from "inaturalistjs";

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
      e,
      { context: { functionName: "deleteRemoteObservationSound", opts } },
    );
  }
};

export default deleteRemoteObservationSound;
