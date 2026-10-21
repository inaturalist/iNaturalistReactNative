import type { ErrorWithResponse, INatApiError } from "api/error";
import handleError from "api/error";
import { ICONIC_TAXA_COUNTS_FIELDS } from "api/fields";
import type {
  ApiObservationFilterParams,
  ApiObservationsSearchParams,
  ApiOpts,
  ApiParams,
  ApiPhotoWithLicense,
  ApiResponse,
  ApiUntypedParams,
  ApiUser,
} from "api/types";
import inatjs from "inaturalistjs";
import type { SortDirection } from "types/sorting";

interface RemoteObservationWithPhotos {
  observationPhotos?: ApiPhotoWithLicense[];
  observation_photos?: ApiPhotoWithLicense[];
}

export interface ApiObserverCount {
  observation_count: number;
  species_count?: number;
  user: ApiUser;
  user_id?: number;
}

export interface ApiIdentifierCount {
  count: number;
  user: ApiUser;
  user_id?: number;
}

export interface ObserverCountsParams extends ApiObservationFilterParams {
  order?: ApiObservationsSearchParams["order"];
  order_by?: "observation_count" | "species_count";
}

export interface IdentifierCountsParams extends ApiObservationFilterParams {
  order?: ApiObservationsSearchParams["order"];
  order_by?: ApiObservationsSearchParams["order_by"];
}

// I tried doing this in Observation.js but got mysterious Realm errors. More
// could be here, but this solves an immediate problem with schema mismatch
function mapObsPhotoToLocalSchema<T extends ApiPhotoWithLicense>( obsPhoto: T ): T {
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
      e as ErrorWithResponse,
      { context: { functionName: "searchObservations", opts } },
    );
  }
};

const faveObservation = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.observations.fave( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "faveObservation", opts } },
    );
  }
};

const unfaveObservation = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.observations.unfave( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "unfaveObservation", opts } },
    );
  }
};

const fetchObservers = async (
  params: ObserverCountsParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<ApiObserverCount> | null> => {
  try {
    return await inatjs.observations.observers( params, opts );
  } catch ( e ) {
    await handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchObservers", opts } },
    );
    return null;
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
      e as ErrorWithResponse,
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
      e as ErrorWithResponse,
      { context: { functionName: "fetchRemoteObservations", uuids, opts } },
    );
  }
};

const markAsReviewed = async ( params: ApiUntypedParams = {}, opts: ApiOpts = {} ) => {
  try {
    return await inatjs.observations.review( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
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
      e as ErrorWithResponse,
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
      e as ErrorWithResponse,
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
      e as ErrorWithResponse,
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
      e as ErrorWithResponse,
      { context: { functionName: "createOrUpdateEvidence", opts } },
    );
  }
};

// Accepts only a user_id for now, but could be widened to accept a login string or an array of
// ids or logins. This endpoint was created to assist with building the grouped-by-iconic-taxa
// view for My Observations, so for now, narrowing to number only is a deliberate simplification
// for what this feature actually needs.
export interface IconicTaxaCountsParams extends ApiParams {
  user_id?: number;
}

export interface IconicTaxonCountResult {
  count: number;
  taxon: { name: string } | null;
}

const fetchIconicTaxaCounts = async (
  params: IconicTaxaCountsParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<IconicTaxonCountResult> | null | ErrorWithResponse | INatApiError> => {
  try {
    return await inatjs.observations.iconicTaxaCounts(
      { fields: ICONIC_TAXA_COUNTS_FIELDS, ...params },
      opts,
    );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchIconicTaxaCounts", opts } },
    );
  }
};

const fetchIdentifiers = async (
  params: IdentifierCountsParams = {},
  opts: ApiOpts = {},
): Promise<ApiResponse<ApiIdentifierCount> | null> => {
  try {
    return await inatjs.observations.identifiers( params, opts );
  } catch ( e ) {
    await handleError(
      e as ErrorWithResponse,
      { context: { functionName: "fetchIdentifiers", opts } },
    );
    return null;
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
      e as ErrorWithResponse,
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
    return handleError( e as ErrorWithResponse, {
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
      e as ErrorWithResponse,
      { context: { functionName: "deleteRemoteObservation", opts } },
    );
  }
};

export interface SpeciesCountsParams extends ApiParams {
  lat?: number;
  lng?: number;
  order?: SortDirection;
  order_by?: "count";
  project_id?: number;
  taxon_id?: number | number[];
  user_id?: number;
}

const fetchSpeciesCounts = async (
  params: SpeciesCountsParams = {},
  opts: ApiOpts = {},
) => {
  try {
    return inatjs.observations.speciesCounts( params, opts );
  } catch ( e ) {
    return handleError(
      e as ErrorWithResponse,
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
      e as ErrorWithResponse,
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
      e as ErrorWithResponse,
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
      e as ErrorWithResponse,
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
  fetchIconicTaxaCounts,
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
