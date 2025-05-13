import { createOrUpdateEvidence } from "api/observations";
import inatjs from "inaturalistjs";
import { markRecordUploaded, prepareMediaForUpload } from "uploaders";
import { trackEvidenceUpload } from "uploaders/utils/progressTracker.ts";

const uploadSingleEvidence = async (
  evidence: Object,
  type: string,
  action: "upload" | "attach" | "update",
  observationId?: number | null,
  apiEndpoint: Function,
  options: Object,
  observationUUID?: string,
  realm: Object
) => {
  const params = prepareMediaForUpload(
    evidence,
    type,
    action,
    observationId
  );
  const evidenceUUID = evidence.uuid;

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
      record: evidence
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

const uploadEvidenceBatch = async (
  evidence: Array<Object>,
  type: string,
  action: "upload" | "attach" | "update",
  observationId?: number | null,
  apiEndpoint: Function,
  options: Object,
  observationUUID?: string,
  realm: Object
): Promise<unknown> => {
  if ( !evidence || evidence.length === 0 ) {
    return null;
  }

  const responses = await Promise.all(
    evidence.map( item => uploadSingleEvidence(
      item,
      type,
      action,
      observationId,
      apiEndpoint,
      options,
      observationUUID,
      realm
    ) )
  );
  // eslint-disable-next-line consistent-return
  return responses[0];
};

const filterMediaForUpload = observation => {
  const hasPhotos = observation?.observationPhotos?.length > 0;

  // get photos that haven't been synced yet
  const unsyncedObservationPhotos = hasPhotos
    ? observation.observationPhotos.filter( op => !op.wasSynced( ) )
    : [];

  // extract the actual photo objects
  const unsyncedPhotos = unsyncedObservationPhotos?.map( op => {
    try {
      return op.photo;
    } catch ( accessError ) {
      if ( !accessError.message.match( /No object with key/ ) ) {
        throw accessError;
      }
      return null;
    }
  } ).filter( Boolean ).flat();

  // get photos that have been synced but need updating
  const modifiedObservationPhotos = hasPhotos
    ? observation.observationPhotos.filter( op => op.wasSynced( ) && op.needsSync( ) )
    : [];

  // get sounds that haven't been synced yet
  const hasSounds = observation.observationSounds?.length > 0;
  const unsyncedObservationSounds = hasSounds
    ? observation.observationSounds.filter( item => !item.wasSynced( ) )
    : [];

  return {
    unsyncedPhotos,
    unsyncedObservationPhotos,
    modifiedObservationPhotos,
    unsyncedObservationSounds
  };
};

async function uploadObservationMedia( observation, options, realm ) {
  const {
    unsyncedPhotos,
    unsyncedObservationPhotos,
    modifiedObservationPhotos,
    unsyncedObservationSounds
  } = filterMediaForUpload( observation );

  // Upload photos and sounds in parallel
  await Promise.all( [
    unsyncedPhotos.length > 0
      ? uploadEvidenceBatch(
        unsyncedPhotos,
        "Photo",
        "upload",
        null,
        inatjs.photos.create,
        options,
        observation.uuid,
        realm
      )
      : null,
    unsyncedObservationSounds.length > 0
      ? uploadEvidenceBatch(
        unsyncedObservationSounds,
        "ObservationSound",
        "upload",
        null,
        inatjs.sounds.create,
        options,
        observation.uuid,
        realm
      )
      : null
  ] );

  return {
    unsyncedObservationPhotos,
    modifiedObservationPhotos,
    unsyncedObservationSounds
  };
}

async function attachMediaToObservation( observationUUID, mediaItems, options, realm ) {
  // Make sure this happens *after* ObservationPhotos and ObservationSounds
  // are created so the observation doesn't appear uploaded until all its
  // media successfully uploads
  const {
    unsyncedObservationPhotos,
    modifiedObservationPhotos,
    unsyncedObservationSounds
  } = mediaItems;

  await Promise.all( [
    // Attach the newly uploaded photos to the uploaded observation
    unsyncedObservationPhotos.length > 0
      ? uploadEvidenceBatch(
        unsyncedObservationPhotos,
        "ObservationPhoto",
        "attach",
        observationUUID,
        inatjs.observation_photos.create,
        options,
        observationUUID,
        realm
      )
      : null,
    // Attach the newly uploaded sounds to the uploaded observation
    unsyncedObservationSounds.length > 0
      ? uploadEvidenceBatch(
        unsyncedObservationSounds,
        "ObservationSound",
        "attach",
        observationUUID,
        inatjs.observation_sounds.create,
        options,
        observationUUID,
        realm
      )
      : null,
    // Update any existing modified photos
    modifiedObservationPhotos.length > 0
      ? uploadEvidenceBatch(
        modifiedObservationPhotos,
        "ObservationPhoto",
        "update",
        observationUUID,
        inatjs.observation_photos.update,
        options,
        observationUUID,
        realm
      )
      : null
  ] );
}

export {
  attachMediaToObservation,
  uploadObservationMedia
};
