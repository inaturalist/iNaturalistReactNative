// @flow

import inatjs from "inaturalistjs";

import handleError from "./error";

// I tried doing this in Observaiton.js but got mysterious Realm errors. More
// could be here, but this solves an immediate problem with schema mismatch
function mapObsPhotoToLocalSchema( obsPhoto ) {
  obsPhoto.photo.licenseCode = obsPhoto.photo.licenseCode
    || obsPhoto.photo.license_code;
  return obsPhoto;
}
function mapToLocalSchema( observation ) {
  observation.observationPhotos = observation?.observationPhotos?.map( mapObsPhotoToLocalSchema );
  observation.observation_photos = observation?.observation_photos?.map( mapObsPhotoToLocalSchema );
  return observation;
}

const searchObservations = async ( params: Object = {}, opts: Object = {} ): Promise<Object> => {
  try {
    const response = await inatjs.observations.search( params, opts );
    response.results = response.results.map( mapToLocalSchema );
    return response;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "searchObservations", opts } } );
  }
};

const faveObservation = async ( params: Object = {}, opts: Object = {} ): Promise<?number> => {
  try {
    return await inatjs.observations.fave( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "faveObservation", opts } } );
  }
};

const unfaveObservation = async ( params: Object = {}, opts: Object = {} ): Promise<?number> => {
  try {
    return await inatjs.observations.unfave( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "unfaveObservation", opts } } );
  }
};

const fetchRemoteObservation = async (
  uuid: string,
  params: Object = {},
  opts: Object = {},
): Promise<?number> => {
  try {
    const response = await inatjs.observations.fetch(
      uuid,
      params,
      opts,
    );
    if ( !response ) { return null; }
    const { results } = response;
    if ( results?.length > 0 ) {
      return mapToLocalSchema( results[0] );
    }
    return null;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchRemoteObservation", uuid, opts } } );
  }
};

const fetchRemoteObservations = async (
  uuids: string[],
  params: Object = {},
  opts: Object = {},
): Promise<?Object[]> => {
  try {
    const response = await inatjs.observations.fetch(
      uuids,
      params,
      opts,
    );
    if ( !response ) { return null; }
    const { results } = response;
    if ( results?.length > 0 ) {
      return results.map( mapToLocalSchema );
    }
    return null;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchRemoteObservations", uuids, opts } } );
  }
};

const markAsReviewed = async ( params: Object = {}, opts: Object = {} ): Promise<?number> => {
  try {
    return await inatjs.observations.review( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "markAsReviewed", opts } } );
  }
};

const markObservationUpdatesViewed = async (
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    return await inatjs.observations.viewedUpdates( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "markObservationUpdatesViewed", opts } } );
  }
};

const createObservation = async (
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    return await inatjs.observations.create( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "createObservation", opts } } );
  }
};

const updateObservation = async (
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    return await inatjs.observations.update( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "updateObservation", opts } } );
  }
};

// TODO: replace this. It doesn't do anything specific to creating or updateing
// evidence, it just wraps an API call, so it could be renamed
// to "callEndpoint", or maybe we should preserve abstraction from inatjs and
// not accept an inatjs endpoint and replace this with several functions
const createOrUpdateEvidence = async (
  apiEndpoint: Function,
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    return await apiEndpoint( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "createOrUpdateEvidence", opts } } );
  }
};

const fetchObservationUpdates = async (
  params: Object = {},
  opts: Object = {},
): Promise<?Object> => {
  try {
    const { results } = await inatjs.observations.updates( params, opts );
    return results;
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchObservationUpdates", opts } } );
  }
};

const fetchUnviewedObservationUpdatesCount = async (
  params: Object = {},
  opts: Object = {},
): Promise<number> => {
  try {
    const { total_results: updatesCount } = await inatjs.observations.updates( {
      ...params,
      viewed: false,
      per_page: 0,
    }, opts );
    return updatesCount;
  } catch ( e ) {
    return handleError( e, {
      context: {
        functionName: "fetchUnviewedObservationUpdatesCount",
        opts,
      },
    } );
  }
};

const deleteRemoteObservation = async (
  params: Object = {},
  opts: Object = {},
) : Promise<?Object> => {
  try {
    return await inatjs.observations.delete( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "deleteRemoteObservation", opts } } );
  }
};

const fetchObservers = async ( params: Object = {} ) : Promise<?Object> => {
  try {
    return inatjs.observations.observers( params );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchObservers" }, throw: true } );
  }
};

const fetchIdentifiers = async ( params: Object = {} ) : Promise<?Object> => {
  try {
    return await inatjs.observations.identifiers( params );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchIdentifiers" } } );
  }
};

const fetchSpeciesCounts = async (
  params: Object = {},
  opts: Object = {},
) : Promise<?Object> => {
  try {
    return inatjs.observations.speciesCounts( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchSpeciesCounts", opts } } );
  }
};

const checkForDeletedObservations = async (
  params: Object = {},
  opts: Object = {},
) : Promise<?Object> => {
  try {
    return await inatjs.observations.deleted( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "checkForDeletedObservations", opts } } );
  }
};

const fetchSubscriptions = async (
  params: Object = {},
  opts: Object = {},
) : Promise<?Object> => {
  try {
    return inatjs.observations.subscriptions( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "fetchSubscriptions", opts } } );
  }
};

const createSubscription = async (
  params: Object = {},
  opts: Object = {},
) : Promise<?Object> => {
  try {
    return inatjs.observations.subscribe( params, opts );
  } catch ( e ) {
    return handleError( e, { context: { functionName: "createSubscription", opts } } );
  }
};

export {
  checkForDeletedObservations,
  createObservation,
  createOrUpdateEvidence,
  createSubscription,
  deleteRemoteObservation,
  faveObservation,
  fetchIdentifiers,
  fetchObservationUpdates,
  fetchObservers,
  fetchRemoteObservation,
  fetchRemoteObservations,
  fetchSpeciesCounts,
  fetchSubscriptions,
  fetchUnviewedObservationUpdatesCount,
  markAsReviewed,
  markObservationUpdatesViewed,
  searchObservations,
  unfaveObservation,
  updateObservation,
};
