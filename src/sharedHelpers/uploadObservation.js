// @flow
import { INatApiError } from "api/error";
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
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const UPLOAD_PROGRESS_INCREMENT = 1;
const HALF_PROGRESS_INCREMENT = UPLOAD_PROGRESS_INCREMENT / 2;

// The reason this doesn't simply accept the record is because we're not being
// strict about using Realm.Objects, so sometimes the thing we just uploaded
// is a Realm.Object and sometimes it's a POJO, but in order to mark it as
// uploaded and add a server-assigned id attribute, we need to find the
// matching Realm.Object
const findRecordToMark = ( realm, observationUUID, recordUUID, type, options = {} ) => {
  const observation = realm?.objectForPrimaryKey( "Observation", observationUUID );

  switch ( type ) {
    case "Observation":
      return observation;
    case "ObservationPhoto":
      return observation?.observationPhotos?.find( op => op.uuid === recordUUID );
    case "ObservationSound":
      return observation?.observationSounds?.find( os => os.uuid === recordUUID );
    case "Photo":
      return options?.record;
    default:
      throw new Error( `Unknown record type: ${type}` );
  }
};

const markRecordUploaded = ( realm, observationUUID, recordUUID, type, response, options = {} ) => {
  const { id } = response.results[0];
  if ( !realm || realm.isClosed ) return;

  const record = findRecordToMark( realm, observationUUID, recordUUID, type, options );

  if ( !record ) {
    throw new Error(
      `Cannot find local Realm object to mark as updated (${type}), recordUUID: ${recordUUID || ""}`
    );
  }

  try {
    safeRealmWrite(
      realm,
      () => {
        record.id = id;
        record._synced_at = new Date( );
        if ( type === "Observation" ) {
          record.needs_sync = false;
        }
      },
      `Marking record uploaded, type: ${type}`
    );
  } catch ( realmWriteError ) {
    if ( realmWriteError.message.match( /invalidated or deleted/ ) ) {
      safeRealmWrite(
        realm,
        () => {
          record.id = id;
          record._synced_at = new Date();
          if ( type === "Observation" ) {
            record.needs_sync = false;
          }
        },
        `Marking record uploaded (retry), type: ${type}`
      );
    }
  }
};

const removeNullValues = obj => {
  // Remove all null values, b/c the API doesn't seem to like them for some
  // reason (might be an error with the API as of 20220801)
  const newObs = {};
  Object.keys( obj ).forEach( k => {
    if ( obj[k] !== null ) {
      newObs[k] = obj[k];
    }
  } );
  return newObs;
};

const prepareEvidenceForUpload = evidence => {
  if ( evidence.photo ) {
    const preparedEvidence = evidence.toJSON
      ? evidence.toJSON()
      : { ...evidence };
    preparedEvidence.photo = removeNullValues( preparedEvidence.photo );
    return preparedEvidence;
  }
  return evidence;
};

const uploadEvidenceWithProgress = async (
  evidence,
  type,
  apiSchemaMapper,
  observationId,
  apiEndpoint,
  options,
  observationUUID,
  realm,
  updateTotalUploadProgress
) => {
  const uploadToServer = async currentEvidence => {
    const preparedEvidence = prepareEvidenceForUpload( currentEvidence );
    const params = apiSchemaMapper( observationId, preparedEvidence );

    const response = await createOrUpdateEvidence(
      apiEndpoint,
      params,
      options
    );

    if ( response && observationUUID ) {
      updateTotalUploadProgress( observationUUID, HALF_PROGRESS_INCREMENT );
      markRecordUploaded(
        realm,
        observationUUID,
        preparedEvidence.uuid,
        type,
        response,
        { record: preparedEvidence }
      );
    }

    return response;
  };

  return Promise.all( evidence.map( uploadToServer ) );
};

const validateApiToken = async ( ) => {
  const apiToken = getJWT( );
  // don't bother trying to upload unless there's a logged in user
  if ( !apiToken ) {
    throw new Error( "Cannot upload observation without API token" );
  }
  return apiToken;
};

const uploadOrUpdateObservation = async (
  preparedObs,
  uploadOptions,
  obs
) => {
  const uploadParams = {
    observation: preparedObs,
    fields: { id: true }
  };

  const wasPreviouslySynced = obs.wasSynced();

  const response = wasPreviouslySynced
    ? await updateObservation( {
      ...uploadParams,
      id: preparedObs.uuid,
      ignore_photos: true
    }, uploadOptions )
    : await createObservation( uploadParams, uploadOptions );
  return response;
};

const getUnsyncedPhotos = obs => {
  const hasPhotos = obs?.observationPhotos?.length > 0;
  return hasPhotos
    ? obs.observationPhotos
      .filter( op => !op.wasSynced() )
      .map( op => {
        try {
          return op.photo;
        } catch ( accessError ) {
          if ( !accessError.message.match( /No object with key/ ) ) {
            throw accessError;
          }
          return null;
        }
      } )
      .filter( photo => photo !== null )
    : [];
};

const getUnsyncedSounds = obs => ( obs.observationSounds.length > 0
  ? obs.observationSounds.filter( item => !item.wasSynced() )
  : [] );

const uploadUnsyncedSounds = async ( obs, uploadOptions, realm, updateTotalUploadProgress ) => {
  const unsyncedSounds = getUnsyncedSounds( obs );
  if ( unsyncedSounds.length > 0 ) {
    await uploadEvidenceWithProgress(
      unsyncedSounds,
      "ObservationSound",
      ObservationSound.mapSoundForUpload,
      null,
      inatjs.sounds.create,
      uploadOptions,
      obs.uuid,
      realm,
      updateTotalUploadProgress
    );
  }
};

const uploadUnsyncedPhotos = async ( obs, uploadOptions, realm, updateTotalUploadProgress ) => {
  const unsyncedPhotos = getUnsyncedPhotos( obs );
  if ( unsyncedPhotos.length > 0 ) {
    await uploadEvidenceWithProgress(
      unsyncedPhotos,
      "Photo",
      ObservationPhoto.mapPhotoForUpload,
      null,
      inatjs.photos.create,
      uploadOptions,
      obs.uuid,
      realm,
      updateTotalUploadProgress
    );
  }
};

const uploadUnsyncedMedia = async ( obs, uploadOptions, realm, updateTotalUploadProgress ) => {
  await Promise.all( [
    uploadUnsyncedPhotos( obs, uploadOptions, realm, updateTotalUploadProgress ),
    uploadUnsyncedSounds( obs, uploadOptions, realm, updateTotalUploadProgress )
  ] );
};

const attachUnsyncedPhotos = async (
  obs,
  obsUUID,
  uploadOptions,
  realm,
  updateTotalUploadProgress
) => {
  const unsyncedObservationPhotos = obs?.observationPhotos?.filter( op => !op.wasSynced() ) || [];
  if ( unsyncedObservationPhotos.length > 0 ) {
    await uploadEvidenceWithProgress(
      unsyncedObservationPhotos,
      "ObservationPhoto",
      ObservationPhoto.mapPhotoForAttachingToObs,
      obsUUID,
      inatjs.observation_photos.create,
      uploadOptions,
      obsUUID,
      realm,
      updateTotalUploadProgress
    );
  }
};

const attachUnsyncedSounds = async (
  obs,
  obsUUID,
  uploadOptions,
  realm,
  updateTotalUploadProgress
) => {
  const unsyncedObservationSounds = obs.observationSounds.filter( item => !item.wasSynced() );
  if ( unsyncedObservationSounds.length > 0 ) {
    await uploadEvidenceWithProgress(
      unsyncedObservationSounds,
      "ObservationSound",
      ObservationSound.mapSoundForAttachingToObs,
      obsUUID,
      inatjs.observation_sounds.create,
      uploadOptions,
      obsUUID,
      realm,
      updateTotalUploadProgress
    );
  }
};

const updateModifiedPhotos = async (
  obs,
  obsUUID,
  uploadOptions,
  realm,
  updateTotalUploadProgress
) => {
  const modifiedObservationPhotos = obs?.observationPhotos?.filter(
    op => op.wasSynced( ) && op.needsSync( )
  ) || [];
  if ( modifiedObservationPhotos.length > 0 ) {
    await uploadEvidenceWithProgress(
      modifiedObservationPhotos,
      "ObservationPhoto",
      ObservationPhoto.mapPhotoForUpdating,
      obsUUID,
      inatjs.observation_photos.update,
      uploadOptions,
      obsUUID,
      realm,
      updateTotalUploadProgress
    );
  }
};

const attachMediaToObservation = async (
  obs,
  obsUUID,
  uploadOptions,
  realm,
  updateTotalUploadProgress
) => {
  await Promise.all( [
    attachUnsyncedPhotos( obs, obsUUID, uploadOptions, realm, updateTotalUploadProgress ),
    attachUnsyncedSounds( obs, obsUUID, uploadOptions, realm, updateTotalUploadProgress ),
    updateModifiedPhotos( obs, obsUUID, uploadOptions, realm, updateTotalUploadProgress )
  ] );
};

const fetchAndUpsertRemoteObservation = async ( obsUUID, realm, options = {} ) => {
  const remoteObs = await fetchRemoteObservation(
    obsUUID,
    { fields: Observation.LIST_FIELDS },
    options
  );
  Observation.upsertRemoteObservations( [remoteObs], realm, { force: true } );
};

const finalizeObservationUpload = ( response, realm, updateTotalUploadProgress ) => {
  const { uuid } = response.results[0];
  updateTotalUploadProgress( uuid, HALF_PROGRESS_INCREMENT );
  markRecordUploaded( realm, uuid, null, "Observation", response );
  return fetchAndUpsertRemoteObservation( uuid, realm );
};

async function uploadObservation( obs: Object, realm: Object, opts: Object = {} ): Object {
  const { updateTotalUploadProgress } = opts;
  updateTotalUploadProgress( obs.uuid, HALF_PROGRESS_INCREMENT );
  const apiToken = await validateApiToken( );
  const uploadOptions = { api_token: apiToken };

  const newObs = removeNullValues( Observation.mapObservationForUpload( obs ) );

  await uploadUnsyncedMedia(
    obs,
    uploadOptions,
    realm,
    updateTotalUploadProgress
  );

  const response = await uploadOrUpdateObservation(
    newObs,
    uploadOptions,
    obs
  );

  if ( !response ) return response;

  await attachMediaToObservation(
    obs,
    response.results[0].uuid,
    uploadOptions,
    realm,
    updateTotalUploadProgress
  );

  finalizeObservationUpload( response, realm, updateTotalUploadProgress );

  return response;
}

export function handleUploadError( uploadError: Error | INatApiError, t: Function ): string {
  let { message } = uploadError;
  // uploadError might be an INatApiError but I don't know how to tell flow to
  // shut up about the possibility that uploadError might not have this
  // attribute... even though ?. will prevent that from being a problem.
  // ~~~~kueda20240523
  // $FlowIgnore
  if ( uploadError?.json?.errors ) {
    // TODO localize comma join
    message = uploadError.json.errors.map( e => {
      if ( e.message?.errors ) {
        if ( typeof ( e.message.errors.flat ) === "function" ) {
          return e.message.errors.flat( ).join( ", " );
        }
        return String( e.message.errors );
      }
      // 410 error for observations previously deleted uses e.message?.error format
      return e.message?.error || e.message;
    } ).join( ", " );
  } else if ( uploadError.message?.match( /Network request failed/ ) ) {
    message = t( "Connection-problem-Please-try-again-later" );
  } else {
    throw uploadError;
  }
  return message;
}

export default uploadObservation;
