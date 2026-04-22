// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const deleteRemoteObservationSound = async (
  params: Object = {},
  opts: Object = {},
) : Promise<?Object> => {
  try {
    return await inatjs.observation_sounds.delete( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "deleteRemoteObservationSound", opts } } );
  }
};

export default deleteRemoteObservationSound;
