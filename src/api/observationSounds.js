// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

const deleteRemoteObservationSound = async (
  params: any = {},
  opts: any = {}
) : Promise<?any> => {
  try {
    return await inatjs.observation_sounds.delete( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export default deleteRemoteObservationSound;
