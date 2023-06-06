// @flow

import inatjs from "inaturalistjs";
import emitUploadProgress from "sharedHelpers/emitEvent";

import handleError from "./error";

const searchObservations = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.observations.search( params, opts );
    return results || [];
  } catch ( e ) {
    return handleError( e, { throw: true } );
  }
};

const faveObservation = async ( params: Object = {}, opts: Object = {} ): Promise<?number> => {
  try {
    return await inatjs.observations.fave( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const unfaveObservation = async ( params: Object = {}, opts: Object = {} ): Promise<?number> => {
  try {
    return await inatjs.observations.unfave( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchRemoteObservation = async (
  uuid: string,
  params: Object = {},
  opts: Object = {}
): Promise<?number> => {
  try {
    const { results } = await inatjs.observations.fetch(
      uuid,
      params,
      opts
    );
    if ( results?.length > 0 ) {
      return results[0];
    }
    return null;
  } catch ( e ) {
    return handleError( e, { throw: true } );
  }
};

const markAsReviewed = async ( params: Object = {}, opts: Object = {} ): Promise<?number> => {
  try {
    return await inatjs.observations.review( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const markObservationUpdatesViewed = async (
  params: Object = {},
  opts: Object = {}
): Promise<?any> => {
  try {
    return await inatjs.observations.viewedUpdates( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const createObservation = async (
  params: Object = {},
  opts: Object = {}
): Promise<?any> => {
  try {
    const obs = await inatjs.observations.create( params, opts );
    emitUploadProgress( params.observation.uuid, 0.5 );
    return obs;
  } catch ( e ) {
    return handleError( e );
  }
};

const updateObservation = async (
  params: Object = {},
  opts: Object = {}
): Promise<?any> => {
  try {
    const obs = await inatjs.observations.update( params, opts );
    emitUploadProgress( params.observation.uuid, 0.5 );
    return obs;
  } catch ( e ) {
    return handleError( e );
  }
};

const createOrUpdateEvidence = async (
  apiEndpoint: Function,
  uuid: string,
  trackProgress: boolean,
  params: Object = {},
  opts: Object = {}
): Promise<?any> => {
  try {
    const evidence = await apiEndpoint( params, opts );
    // only emit progress when an observation photo is attached
    // to an observation, not when the photo is created on the website
    if ( trackProgress ) {
      emitUploadProgress( uuid, 1 );
    }
    return evidence;
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchObservationUpdates = async (
  params: Object = {},
  opts: Object = {}
): Promise<?any> => {
  try {
    const { results } = await inatjs.observations.updates( params, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { throw: true } );
  }
};

const deleteObservation = async ( params: Object = {}, opts: Object = {} ) : Promise<?any> => {
  try {
    return await inatjs.observations.delete( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  createObservation,
  createOrUpdateEvidence,
  deleteObservation,
  faveObservation,
  fetchObservationUpdates,
  fetchRemoteObservation,
  markAsReviewed,
  markObservationUpdatesViewed,
  searchObservations,
  unfaveObservation,
  updateObservation
};
