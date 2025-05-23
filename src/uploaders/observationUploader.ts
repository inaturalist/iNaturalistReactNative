import {
  createObservation,
  updateObservation
} from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import Realm from "realm";
import { RealmObservation, RealmObservationPojo } from "realmModels/types.d.ts";
import {
  markRecordUploaded,
  prepareObservationForUpload
} from "uploaders";
import {
  attachMediaToObservation,
  uploadObservationMedia
} from "uploaders/mediaUploader.ts";
import { trackObservationUpload } from "uploaders/utils/progressTracker.ts";

interface UploadOptions {
  api_token?: string;
  signal: AbortController
}

interface UploadParams {
  observation: Partial<RealmObservationPojo>;
  fields: {
    id: boolean;
  };
  id?: string; // for updating observation only
  ignore_photos?: boolean; // for updating observation only
}

interface ObservationApiResponse {
  page: number;
  per_page: number;
  total_results: number;
  results: Array<{
    uuid: string;
    id: number;
  }>;
}

async function validateAndGetToken( ): Promise<string> {
  const apiToken = await getJWT( );
  if ( !apiToken ) {
    throw new Error( "Gack, tried to upload an observation without API token!" );
  }
  return apiToken;
}

async function createOrUpdateObservation(
  observation: RealmObservation,
  newObs: Partial<RealmObservationPojo>,
  options: UploadOptions
): Promise<ObservationApiResponse | null> {
  const wasPreviouslySynced = observation.wasSynced( );
  const uploadParams: UploadParams = {
    observation: { ...newObs },
    fields: { id: true }
  };

  if ( wasPreviouslySynced ) {
    return updateObservation( {
      ...uploadParams,
      id: newObs.uuid,
      ignore_photos: true
    }, options );
  }
  return createObservation( uploadParams, options );
}

async function uploadObservation(
  observation: RealmObservation,
  realm: Realm,
  opts: UploadOptions
): Promise<ObservationApiResponse | null> {
  const obsProgress = trackObservationUpload( observation.uuid );
  obsProgress.start( );

  const newObs = prepareObservationForUpload( observation );

  // Step 1: upload the photos/sounds (before uploading the observation itself)
  let apiToken = await validateAndGetToken( );
  const mediaItems = await uploadObservationMedia(
    observation,
    { ...opts, api_token: apiToken },
    realm
  );

  // Step 2: upload or modify observation with revalidated token
  apiToken = await validateAndGetToken( );
  const response = await createOrUpdateObservation(
    observation,
    newObs,
    { ...opts, api_token: apiToken }
  );

  obsProgress.complete( );
  if ( !response ) {
    return response;
  }

  const { uuid: obsUUID } = response.results[0];

  // Step 3: attach media to observation with revalidated token
  apiToken = await validateAndGetToken( );
  await attachMediaToObservation(
    obsUUID,
    mediaItems,
    { ...opts, api_token: apiToken },
    realm
  );

  // Step 4: mark observation as uploaded in realm
  markRecordUploaded( observation.uuid, null, "Observation", response, realm );
  // note: removed observation fetch at the end of the upload, because we don't actually
  // need this operation here
  return response;
}

export default uploadObservation;
