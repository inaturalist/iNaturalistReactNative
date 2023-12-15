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

const searchObservations = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const response = await inatjs.observations.search( params, opts );
    response.results = response.results.map( mapToLocalSchema );
    return response;
  } catch ( e ) {
    return handleError( e );
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
    const response = await inatjs.observations.fetch(
      uuid,
      params,
      opts
    );
    if ( !response ) { return null; }
    const { results } = response;
    if ( results?.length > 0 ) {
      return mapToLocalSchema( results[0] );
    }
    return null;
  } catch ( e ) {
    return handleError( e );
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
    return await inatjs.observations.create( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const updateObservation = async (
  params: Object = {},
  opts: Object = {}
): Promise<?any> => {
  try {
    return await inatjs.observations.update( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const createOrUpdateEvidence = async (
  apiEndpoint: Function,
  params: Object = {},
  opts: Object = {}
): Promise<?any> => {
  try {
    return await apiEndpoint( params, opts );
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
    return handleError( e );
  }
};

const deleteObservation = async ( params: Object = {}, opts: Object = {} ) : Promise<?any> => {
  try {
    return await inatjs.observations.delete( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchObservers = async ( params: Object = {} ) : Promise<?any> => {
  try {
    return await inatjs.observations.observers( params );
  } catch ( e ) {
    return handleError( e, { throw: true } );
  }
};

const fetchIdentifiers = async ( params: Object = {} ) : Promise<?any> => {
  try {
    return await inatjs.observations.identifiers( params );
  } catch ( e ) {
    return handleError( e );
  }
};

const fetchSpeciesCounts = async ( params: Object = {} ) : Promise<?any> => {
  try {
    return await inatjs.observations.speciesCounts( params );
  } catch ( e ) {
    return handleError( e );
  }
};

const checkForDeletedObservations = async (
  params: Object = {},
  opts: Object = {}
) : Promise<?any> => {
  try {
    return await inatjs.observations.deleted( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  checkForDeletedObservations,
  createObservation,
  createOrUpdateEvidence,
  deleteObservation,
  faveObservation,
  fetchIdentifiers,
  fetchObservationUpdates,
  fetchObservers,
  fetchRemoteObservation,
  fetchSpeciesCounts,
  markAsReviewed,
  markObservationUpdatesViewed,
  searchObservations,
  unfaveObservation,
  updateObservation
};
