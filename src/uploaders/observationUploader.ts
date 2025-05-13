import {
  createObservation,
  updateObservation
} from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import {
  markRecordUploaded,
  prepareObservationForUpload
} from "uploaders";
import {
  attachMediaToObservation,
  uploadObservationMedia
} from "uploaders/mediaUploader.ts";
import { trackObservationUpload } from "uploaders/utils/progressTracker.ts";

async function validateAndGetToken( ) {
  const apiToken = await getJWT( );
  if ( !apiToken ) {
    throw new Error( "Gack, tried to upload an observation without API token!" );
  }
  return apiToken;
}

async function createOrUpdateObservation( observation, newObs, options ) {
  const wasPreviouslySynced = observation.wasSynced( );
  const uploadParams = {
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

async function uploadObservation( observation: Object, realm: Object, opts: Object = {} ): Object {
  const obsProgress = trackObservationUpload( observation.uuid );
  obsProgress.start( );

  const apiToken = await validateAndGetToken( );
  const options = { ...opts, api_token: apiToken };

  const newObs = prepareObservationForUpload( observation );

  // Step 1: upload the photos/sounds (before uploading the observation itself)
  const mediaItems = await uploadObservationMedia( observation, options, realm );

  // Step 2: upload or modify observation
  const response = await createOrUpdateObservation( observation, newObs, options );

  if ( !response ) {
    return response;
  }
  obsProgress.complete( );

  const { uuid: obsUUID } = response.results[0];

  // Step 3: attach media to observation
  await attachMediaToObservation( obsUUID, mediaItems, options, realm );

  // Step 4: mark observation as uploaded in realm
  markRecordUploaded( observation.uuid, null, "Observation", response, realm );
  // note: removed observation fetch at the end of the upload, because we don't actually
  // need this operation here
  return response;
}

export default uploadObservation;
