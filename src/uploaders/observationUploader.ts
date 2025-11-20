import {
  createObservation,
  updateObservation
} from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { AppState } from "react-native";
import type Realm from "realm";
import type { RealmObservation, RealmObservationPojo } from "realmModels/types";
import { log } from "sharedHelpers/logger";
import {
  markRecordUploaded,
  prepareObservationForUpload
} from "uploaders";
import {
  attachMediaToObservation,
  uploadObservationMedia
} from "uploaders/mediaUploader";
import { RecoverableError, RECOVERY_BY } from "uploaders/utils/errorHandling";
import { trackObservationUpload } from "uploaders/utils/progressTracker";

const logger = log.extend( "observationUploader" );

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
  const apiToken = await getJWT( false, "upload" );
  if ( !apiToken ) {
    const error = new RecoverableError( "Gack, tried to upload an observation without API token!" );
    error.recoveryBy = RECOVERY_BY.LOGIN_AGAIN;
    throw error;
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

function createErrorContext( stage: string, startTime: number ) {
  const totalDuration = Date.now() - startTime;
  const appState = AppState.currentState;

  let errorContext = `stage: ${stage}`;
  if ( appState === "background" || appState === "inactive" ) {
    errorContext += `, app backgrounded (${appState})`;
  }

  return { errorContext, totalDuration };
}

async function uploadObservation(
  observation: RealmObservation,
  realm: Realm,
  opts: UploadOptions
): Promise<ObservationApiResponse | null> {
  const uploadStartTime = Date.now( );
  const obsProgress = trackObservationUpload( observation.uuid );
  obsProgress.start( );

  const newObs = prepareObservationForUpload( observation );

  // Step 1: upload the photos/sounds (before uploading the observation itself)
  let mediaItems;
  let mediaDuration = 0;
  try {
    const apiToken = await validateAndGetToken( );
    const mediaStartTime = Date.now( );
    mediaItems = await uploadObservationMedia(
      observation,
      { ...opts, api_token: apiToken },
      realm
    );
    mediaDuration = Date.now( ) - mediaStartTime;
  } catch ( error ) {
    const {
      errorContext, totalDuration
    } = createErrorContext( "media_upload", uploadStartTime );
    logger.error(
      `Upload: Failed ${observation.uuid} after ${totalDuration}ms - ${errorContext}`
      + ": Media upload failed",
      error
    );
    error.message = `Media upload failed: ${error.message}`;
    throw error;
  }

  // Step 2: upload or modify observation with revalidated token
  let response;
  let obsDuration = 0;
  try {
    const apiToken = await validateAndGetToken( );
    const obsStartTime = Date.now( );
    response = await createOrUpdateObservation(
      observation,
      newObs,
      { ...opts, api_token: apiToken }
    );
    obsDuration = Date.now( ) - obsStartTime;

    obsProgress.complete( );
    if ( !response ) {
      throw new Error( "No response from observation upload" );
    }
  } catch ( error ) {
    const {
      errorContext, totalDuration
    } = createErrorContext( "observation_upload", uploadStartTime );
    logger.error(
      `Upload: Failed ${observation.uuid} after ${totalDuration}ms - ${errorContext}`
      + ": Observation upload failed",
      error
    );
    error.message = `Observation upload failed: ${error.message}`;
    throw error;
  }

  const { uuid: obsUUID } = response.results[0];

  // Step 3: attach media to observation with revalidated token
  let attachDuration = 0;
  try {
    const apiToken = await validateAndGetToken( );
    const attachStartTime = Date.now( );
    await attachMediaToObservation(
      obsUUID,
      mediaItems,
      { ...opts, api_token: apiToken },
      realm
    );
    attachDuration = Date.now( ) - attachStartTime;
  } catch ( error ) {
    const {
      errorContext, totalDuration
    } = createErrorContext( "media_attachment", uploadStartTime );
    logger.error(
      `Upload: Failed ${observation.uuid} after ${totalDuration}ms - ${errorContext}`
      + ": Media attachment failed",
      error
    );
    error.message = `Media attachment failed: ${error.message}`;
    throw error;
  }

  // Step 4: mark observation as uploaded in realm
  try {
    markRecordUploaded( observation.uuid, null, "Observation", response, realm );
  } catch ( error ) {
    const {
      errorContext, totalDuration
    } = createErrorContext( "realm_update", uploadStartTime );
    logger.error(
      `Upload: Failed ${observation.uuid} after ${totalDuration}ms - ${errorContext}`
      + ": Realm update failed",
      error
    );
    throw new Error( `Realm update failed: ${error.message}` );
  }

  const totalDuration = Date.now( ) - uploadStartTime;
  logger.info(
    `Upload: Completed ${observation.uuid} - total: ${totalDuration}ms`
      + `, media: ${mediaDuration}ms, obs: ${obsDuration}ms, attach: ${attachDuration}ms`
  );

  // note: removed observation fetch at the end of the upload, because we don't actually
  // need this operation here
  return response;
}

export default uploadObservation;
