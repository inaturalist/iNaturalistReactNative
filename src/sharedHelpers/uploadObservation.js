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
import {
  markRecordUploaded,
  prepareMediaForUpload,
  prepareObservationForUpload
} from "uploaders";
import { trackEvidenceUpload, trackObservationUpload } from "uploaders/utils/progressTracker.ts";

const uploadEvidence = async (
  evidence: Array<Object>,
  type: string,
  action: "upload" | "attach" | "update",
  observationId?: number | null,
  apiEndpoint: Function,
  options: Object,
  observationUUID?: string,
  realm: Object
  // $FlowIgnore
): Promise<unknown> => {
  const uploadToServer = async currentEvidence => {
    const params = prepareMediaForUpload(
      currentEvidence,
      type,
      action,
      observationId
    );
    const evidenceUUID = currentEvidence.uuid;

    // Determine if this is an upload or an attachment operation
    // for progress tracking
    const isAttachOperation = observationId != null;
    const evidenceProgress = trackEvidenceUpload( observationUUID );

    const response = await createOrUpdateEvidence(
      apiEndpoint,
      params,
      options
    );

    if ( response && observationUUID ) {
      // TODO: can't mark records as uploaded by primary key for ObsPhotos and ObsSound anymore
      markRecordUploaded( observationUUID, evidenceUUID, type, response, realm, {
        record: currentEvidence
      } );
      if ( isAttachOperation ) {
        // This is attaching evidence to an observation
        evidenceProgress.attached( );
      } else {
        // This is uploading evidence
        evidenceProgress.uploaded( );
      }
    }

    return response;
  };

  const responses = await Promise
    .all( evidence.map( item => uploadToServer( item ) ) );
  // eslint-disable-next-line consistent-return
  return responses[0];
};

async function uploadObservation( obs: Object, realm: Object, opts: Object = {} ): Object {
  const obsProgress = trackObservationUpload( obs.uuid );
  obsProgress.start( );

  const apiToken = await getJWT( );
  // don't bother trying to upload unless there's a logged in user
  if ( !apiToken ) {
    throw new Error(
      "Gack, tried to upload an observation without API token!"
    );
  }
  const options = { ...opts, api_token: apiToken };

  const newObs = prepareObservationForUpload( obs );

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
        "upload",
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
        "upload",
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
  obsProgress.complete( );

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
        "attach",
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
        "attach",
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
        "update",
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
