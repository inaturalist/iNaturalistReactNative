// @flow

import inatjs from "inaturalistjs";

import Observation from "../models/Observation";
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
  fields: "all"
};

const searchObservations = async ( params: Object = {}, opts: Object = {} ): Promise<any> => {
  try {
    const { results } = await inatjs.observations.search( { ...PARAMS, ...params, ...opts } );
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
    return Observation.mimicRealmMappedPropertiesSchema( results[0] );
  } catch ( e ) {
    return handleError( e );
  }
};

export {
  faveObservation,
  fetchRemoteObservation,
  searchObservations,
  unfaveObservation
};
