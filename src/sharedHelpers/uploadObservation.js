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
import emitUploadProgress from "sharedHelpers/emitUploadProgress.ts";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const logger = log.extend( "uploadObservation" );

const UPLOAD_PROGRESS_INCREMENT = 1;

// The reason this doesn't simply accept the record is because we're not being
// strict about using Realm.Objects, so sometimes the thing we just uploaded
// is a Realm.Object and sometimes it's a POJO, but in order to mark it as
// uploaded and add a server-assigned id attribute, we need to find the
// matching Realm.Object
const markRecordUploaded = (
  observationUUID: string,
  recordUUID: string | null,
  type: string,
  response: {
    results: Array<{id: number}>
  },
  realm: Object,
  options?: {
    record: Object
  }
) => {
  const { id } = response.results[0];
  if ( !realm || realm.isClosed ) return;
  function extractRecord( obsUUID, recUUID, recordType, opts ) {
    const observation = realm?.objectForPrimaryKey( "Observation", obsUUID );
    let record;
    if ( recordType === "Observation" ) {
      record = observation;
    } else if ( recordType === "ObservationPhoto" ) {
      const existingObsPhoto = observation?.observationPhotos?.find( op => op.uuid === recUUID );
      record = existingObsPhoto;
    } else if ( recordType === "ObservationSound" ) {
      const existingObsSound = observation?.observationSounds?.find( os => os.uuid === recUUID );
      record = existingObsSound;
    } else if ( recordType === "Photo" ) {
      // Photos do not have UUIDs, so we pass the Photo itself as an option
      record = opts?.record;
    }
    return record;
  }
  let record = extractRecord( observationUUID, recordUUID, type, options );

  if ( !record ) {
    throw new Error(
      `Cannot find local Realm object to mark as updated (${type}), recordUUID: ${recordUUID || ""}`
    );
  }

  try {
    safeRealmWrite( realm, ( ) => {
      // These flow errors don't make any sense b/c if record is undefined, we
      // will throw an error above
      // $FlowIgnore
      record.id = id;
      // $FlowIgnore
      record._synced_at = new Date( );
      if ( type === "Observation" ) {
        // $FlowIgnore
        record.needs_sync = false;
      }
    }, `marking record uploaded in uploadObservation.js, type: ${type}` );
  } catch ( realmWriteError ) {
    // Try it one more time in case it was invalidated but it's still in the
    // database
    if ( realmWriteError.message.match( /invalidated or deleted/ ) ) {
      record = extractRecord( observationUUID, recordUUID, type, options );
      safeRealmWrite( realm, ( ) => {
        // These flow errors don't make any sense b/c if record is undefined, we
        // will throw an error above
        // $FlowIgnore
        record.id = id;
        // $FlowIgnore
        record._synced_at = new Date( );
        if ( type === "Observation" ) {
          // $FlowIgnore
          record.needs_sync = false;
        }
      }, `marking record uploaded in uploadObservation.js, type: ${type}` );
    }
  }
};

const attachEvidence = async (
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
    try {
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
    } catch ( error ) {
      if ( error.status === 401
      || ( error.errors && error.errors[0]?.errorCode === "401" )
      || JSON.stringify( error ).includes( "JWT is missing or invalid" ) ) {
        logger.error( "JWT_ERROR in attachEvidence", {
          type,
          evidenceUUID: currentEvidence.uuid,
          observationUUID,
          errorStatus: error.status,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        } );
      }
      return null;
    }
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
    // filter out null responses, i.e. for photo evidence
    // that doesn't get created when the app is backgrounded
  } ).filter( Boolean ) );
  // eslint-disable-next-line consistent-return
  return responses[0];
};

const uploadEvidence = async (
  evidence: Array<Object>,
  type: string,
  apiSchemaMapper: Function,
  observationId: ?number,
  apiEndpoint: Function,
  options: Object,
  observationUUID?: string
  // $FlowIgnore
): Promise<unknown> => {
  const uploadToServer = async currentEvidence => {
    try {
      const params = apiSchemaMapper( observationId, currentEvidence );

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
      }
      return response;
    } catch ( error ) {
      if ( error.status === 401
      || ( error.errors && error.errors[0]?.errorCode === "401" )
      || JSON.stringify( error ).includes( "JWT is missing or invalid" ) ) {
        logger.error( "JWT_ERROR in uploadEvidence", {
          type,
          evidenceUUID: currentEvidence.uuid,
          observationUUID,
          errorStatus: error.status,
          errorMessage: error.message,
          timestamp: new Date().toISOString()
        } );
      }
      return null;
    }
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
    // filter out null responses, i.e. for photo evidence
    // that doesn't get created when the app is backgrounded
  } ).filter( Boolean ) );
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
        obs.uuid
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
        obs.uuid
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
      ? attachEvidence(
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
      ? attachEvidence(
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
      ? attachEvidence(
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
