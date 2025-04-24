// @flow

import {
  createObservation,
  createOrUpdateEvidence,
  fetchRemoteObservation,
  updateObservation
} from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import inatjs from "inaturalistjs";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import ObservationSound from "realmModels/ObservationSound";
import emitUploadProgress from "sharedHelpers/emitUploadProgress.ts";
import { markRecordUploaded } from "uploaders";

const UPLOAD_PROGRESS_INCREMENT = 1;

const uploadEvidence = async (
  evidence: Array<Object>,
  type: string,
  apiSchemaMapper: Function,
  observationId: ?number,
  apiEndpoint: Function,
  options: Object,
  observationUUID?: string,
  realm: Object
  // $FlowIgnore
): Promise<unknown> => {
  const uploadToServer = async currentEvidence => {
    const params = apiSchemaMapper( observationId, currentEvidence );
    const evidenceUUID = currentEvidence.uuid;

    const response = await createOrUpdateEvidence(
      apiEndpoint,
      params,
      options
    );

    if ( response && observationUUID ) {
      // we're emitting progress increments:
      // one when the upload of obs
      // half one when obsPhoto/obsSound is successfully uploaded
      // half one when the obsPhoto/obsSound is attached to the obs
      emitUploadProgress( observationUUID, ( UPLOAD_PROGRESS_INCREMENT / 2 ) );
      // TODO: can't mark records as uploaded by primary key for ObsPhotos and ObsSound anymore
      markRecordUploaded( observationUUID, evidenceUUID, type, response, realm, {
        record: currentEvidence
      } );
    }

    return response;
  };

  const responses = await Promise.all( evidence.map( item => {
    let currentEvidence = item;

    if ( currentEvidence.photo ) {
      currentEvidence = item.toJSON( );
      // Remove all null values, b/c the API doesn't seem to like them
      const newPhoto = {};
      const { photo } = currentEvidence;
      Object.keys( photo ).forEach( k => {
        if ( photo[k] !== null ) {
          newPhoto[k] = photo[k];
        }
      } );
      currentEvidence.photo = newPhoto;
    }

    return uploadToServer( currentEvidence );
  } ) );
  // eslint-disable-next-line consistent-return
  return responses[0];
};

async function uploadObservation( obs: Object, realm: Object, opts: Object = {} ): Object {
  // we're emitting progress increments:
  // half one when upload of obs started
  // half one when upload of obs finished
  // half one when obsPhoto/obsSound is successfully uploaded
  // half one when the obsPhoto/obsSound is attached to the obs
  emitUploadProgress( obs.uuid, ( UPLOAD_PROGRESS_INCREMENT / 2 ) );
  const apiToken = await getJWT( );
  // don't bother trying to upload unless there's a logged in user
  if ( !apiToken ) {
    throw new Error(
      "Gack, tried to upload an observation without API token!"
    );
  }
  const obsToUpload = Observation.mapObservationForUpload( obs );
  const options = { ...opts, api_token: apiToken };

  // Remove all null values, b/c the API doesn't seem to like them for some
  // reason (might be an error with the API as of 20220801)
  const newObs = {};
  Object.keys( obsToUpload ).forEach( k => {
    if ( obsToUpload[k] !== null ) {
      newObs[k] = obsToUpload[k];
    }
  } );

  let response;

  // First upload the photos/sounds (before uploading the observation itself)
  const hasPhotos = obs?.observationPhotos?.length > 0;
  const unsyncedObservationPhotos = hasPhotos
    ? obs?.observationPhotos?.filter( op => !op.wasSynced( ) )
    : [];
  const unsyncedPhotos = unsyncedObservationPhotos?.map( op => {
    try {
      return op.photo;
    } catch ( accessError ) {
      if ( !accessError.message.match( /No object with key/ ) ) {
        throw accessError;
      }
      return null;
    }
  } ).flat( );
  const modifiedObservationPhotos = hasPhotos
    ? obs?.observationPhotos?.filter( op => op.wasSynced( ) && op.needsSync( ) )
    : [];

  await Promise.all( [
    unsyncedPhotos.length > 0
      ? uploadEvidence(
        unsyncedPhotos,
        "Photo",
        ObservationPhoto.mapPhotoForUpload,
        null,
        inatjs.photos.create,
        options,
        obs.uuid,
        realm
      )
      : null
  ] );

  const hasSounds = obs.observationSounds.length > 0;
  const unsyncedObservationSounds = hasSounds
    ? obs.observationSounds.filter( item => !item.wasSynced( ) )
    : [];
  await Promise.all( [
    unsyncedObservationSounds.length > 0
      ? uploadEvidence(
        unsyncedObservationSounds,
        "ObservationSound",
        ObservationSound.mapSoundForUpload,
        null,
        inatjs.sounds.create,
        options,
        obs.uuid,
        realm
      )
      : null
  ] );

  const wasPreviouslySynced = obs.wasSynced( );
  const uploadParams = {
    observation: { ...newObs },
    fields: { id: true }
  };

  if ( wasPreviouslySynced ) {
    response = await updateObservation( {
      ...uploadParams,
      id: newObs.uuid,
      ignore_photos: true
    }, options );
  } else {
    response = await createObservation( uploadParams, options );
  }
  emitUploadProgress( obs.uuid, ( UPLOAD_PROGRESS_INCREMENT / 2 ) );

  if ( !response ) {
    return response;
  }

  const { uuid: obsUUID } = response.results[0];

  await Promise.all( [
    // Attach the newly uploaded photos/sounds to the uploaded observation
    unsyncedObservationPhotos.length > 0
      ? uploadEvidence(
        unsyncedObservationPhotos,
        "ObservationPhoto",
        ObservationPhoto.mapPhotoForAttachingToObs,
        obsUUID,
        inatjs.observation_photos.create,
        options,
        obsUUID,
        realm
      )
      : null,
    unsyncedObservationSounds.length > 0
      ? uploadEvidence(
        unsyncedObservationSounds,
        "ObservationSound",
        ObservationSound.mapSoundForAttachingToObs,
        obsUUID,
        inatjs.observation_sounds.create,
        options,
        obsUUID,
        realm
      )
      : null,
    // Update any existing modified photos/sounds
    modifiedObservationPhotos.length > 0
      ? uploadEvidence(
        modifiedObservationPhotos,
        "ObservationPhoto",
        ObservationPhoto.mapPhotoForUpdating,
        obsUUID,
        inatjs.observation_photos.update,
        options,
        obsUUID,
        realm
      )
      : null
  ] );
  // Make sure this happens *after* ObservationPhotos and ObservationSounds
  // are created so the observation doesn't appear uploaded until all its
  // media successfully uploads
  markRecordUploaded( obs.uuid, null, "Observation", response, realm );
  // fetch observation and upsert it
  const remoteObs = await fetchRemoteObservation(
    obsUUID,
    { fields: Observation.LIST_FIELDS },
    options
  );
  Observation.upsertRemoteObservations( [remoteObs], realm, { force: true } );
  return response;
}

export default uploadObservation;
