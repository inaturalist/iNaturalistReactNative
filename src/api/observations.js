// @flow

import inatjs from "inaturalistjs";
import Comment from "realmModels/Comment";
import Identification from "realmModels/Identification";
// eslint-disable-next-line import/no-cycle
import Observation from "realmModels/Observation";
import User from "realmModels/User";

import handleError from "./error";

const PHOTO_FIELDS = {
  id: true,
  attribution: true,
  license_code: true,
  url: true
};

const OBSERVATION_PHOTOS_FIELDS = {
  id: true,
  photo: PHOTO_FIELDS,
  position: true,
  uuid: true
};

const TAXON_FIELDS = {
  name: true,
  preferred_common_name: true
};

const FIELDS = {
  observation_photos: OBSERVATION_PHOTOS_FIELDS,
  taxon: TAXON_FIELDS
};

const PARAMS = {
  per_page: 10,
  fields: FIELDS
};

const REMOTE_OBSERVATION_PARAMS = {
  fields: {
    created_at: true,
    uuid: true,
    identifications: Identification.ID_FIELDS,
    comments: Comment.COMMENT_FIELDS,
    category: true,
    updated_at: true,
    observation_photos: OBSERVATION_PHOTOS_FIELDS,
    taxon: {
      default_photo: {
        url: true,
        attribution: true,
        license_code: true
      },
      iconic_taxon_name: true,
      name: true,
      preferred_common_name: true,
      rank: true,
      rank_level: true
    },
    observed_on_string: true,
    latitude: true,
    longitude: true,
    description: true,
    application: {
      name: true
    },
    place_guess: true,
    quality_grade: true,
    time_observed_at: true,
    user: User.USER_FIELDS
  }
};

const searchObservations = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.observations.search( { ...PARAMS, ...params }, opts );
    return results;
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
    const { results } = await inatjs.observations.fetch(
      uuid,
      { ...REMOTE_OBSERVATION_PARAMS, ...params },
      opts
    );
    if ( results?.length > 0 ) {
      return Observation.mimicRealmMappedPropertiesSchema( results[0] );
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
    return await inatjs.observations.create( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

const createEvidence = async (
  apiEndpoint: Function,
  params: Object = {},
  opts: Object = {}
): Promise<?any> => {
  try {
    return await apiEndpoint.create( params, opts );
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  createEvidence,
  createObservation,
  faveObservation,
  fetchRemoteObservation,
  markAsReviewed,
  markObservationUpdatesViewed,
  searchObservations,
  unfaveObservation
};
