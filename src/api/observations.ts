import inatjs from "inaturalistjs";

import handleError from "./error";
import type { ApiOpts, ApiUntypedParams } from "./types";

interface RemotePhotoWithLicense {
  photo: {
    licenseCode?: string | null;
    license_code?: string | null;
  };
}

interface RemoteObservationWithPhotos {
  observationPhotos?: RemotePhotoWithLicense[];
  observation_photos?: RemotePhotoWithLicense[];
}

// I tried doing this in Observation.js but got mysterious Realm errors. More
// could be here, but this solves an immediate problem with schema mismatch
function mapObsPhotoToLocalSchema<T extends RemotePhotoWithLicense>( obsPhoto: T ): T {
  obsPhoto.photo.licenseCode = obsPhoto.photo.licenseCode
    || obsPhoto.photo.license_code;
  return obsPhoto;
}
function mapToLocalSchema<T extends RemoteObservationWithPhotos>( observation: T ): T {
  observation.observationPhotos = observation?.observationPhotos?.map( mapObsPhotoToLocalSchema );
  observation.observation_photos = observation?.observation_photos?.map( mapObsPhotoToLocalSchema );
  return observation;
}

const searchObservations = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    const response = await inatjs.observations.search( params, opts );
    response.results = response.results.map( mapToLocalSchema );
    return response;
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "searchObservations", opts } },
    );
  }
};

const faveObservation = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.observations.fave( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "faveObservation", opts } },
    );
  }
};

const unfaveObservation = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.observations.unfave( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "unfaveObservation", opts } },
    );
  }
};

const fetchRemoteObservation = async (
  uuid: string,
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
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
    return handleError(
      e,
      { context: { functionName: "fetchRemoteObservation", uuid, opts } },
    );
  }
};

const fetchRemoteObservations = async (
  uuids: string[],
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
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
    return handleError(
      e,
      { context: { functionName: "fetchRemoteObservations", uuids, opts } },
    );
  }
};

const markAsReviewed = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.observations.review( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "markAsReviewed", opts } },
    );
  }
};

const markObservationUpdatesViewed = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return await inatjs.observations.viewedUpdates( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "markObservationUpdatesViewed", opts } },
    );
  }
};

const createObservation = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return await inatjs.observations.create( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "createObservation", opts } },
    );
  }
};

const updateObservation = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return await inatjs.observations.update( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "updateObservation", opts } },
    );
  }
};

// TODO: replace this. It doesn't do anything specific to creating or updateing
// evidence, it just wraps an API call, so it could be renamed
// to "callEndpoint", or maybe we should preserve abstraction from inatjs and
// not accept an inatjs endpoint and replace this with several functions
const createOrUpdateEvidence = async <P extends ApiUntypedParams, O extends ApiOpts, T>(
  apiEndpoint: ( params: P, opts: O ) => Promise<T>,
  params: P,
  opts: O,
) => {
  try {
    return await apiEndpoint( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "createOrUpdateEvidence", opts } },
    );
  }
};

const fetchObservationUpdates = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    const { results } = await inatjs.observations.updates( params, opts );
    return results;
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "fetchObservationUpdates", opts } },
    );
  }
};

const fetchUnviewedObservationUpdatesCount = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
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
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return await inatjs.observations.delete( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "deleteRemoteObservation", opts } },
    );
  }
};

const fetchSpeciesCounts = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return inatjs.observations.speciesCounts( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "fetchSpeciesCounts", opts } },
    );
  }
};

const checkForDeletedObservations = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return await inatjs.observations.deleted( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "checkForDeletedObservations", opts } },
    );
  }
};

const fetchSubscriptions = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return inatjs.observations.subscriptions( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "fetchSubscriptions", opts } },
    );
  }
};

const createSubscription = async (
  params: ApiUntypedParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return inatjs.observations.subscribe( params, opts );
  } catch ( e ) {
    return handleError(
      e,
      { context: { functionName: "createSubscription", opts } },
    );
  }
};

export {
  checkForDeletedObservations,
  createObservation,
  createOrUpdateEvidence,
  createSubscription,
  deleteRemoteObservation,
  faveObservation,
  fetchObservationUpdates,
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
