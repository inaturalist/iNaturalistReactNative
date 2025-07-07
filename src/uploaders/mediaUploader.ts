import { createOrUpdateEvidence } from "api/observations";
import inatjs from "inaturalistjs";
import Realm from "realm";
import type {
  RealmObservation,
  RealmObservationPhoto,
  RealmObservationSound,
  RealmPhoto
} from "realmModels/types";
import { markRecordUploaded, prepareMediaForUpload } from "uploaders";
import { trackEvidenceUpload } from "uploaders/utils/progressTracker.ts";

type EvidenceType = "Photo" | "ObservationPhoto" | "ObservationSound";
type ActionType = "upload" | "attach" | "update";

interface UploadOptions {
  api_token?: string;
  signal: AbortController
}

interface MediaApiResponse {
  page: number;
  per_page: number;
  total_results: number;
  results: Array<{
    id: number;
  }>;
}

interface MappedObservationPhotoForUpdating {
  id: string;
  observation_photo: {
    observation_id: number;
    position: number;
  }
}

interface MappedObservationPhotoForAttaching {
  observation_photo: {
    uuid: string;
    observation_id: number;
    photo_id: number;
    position: number;
  }
}

interface MappedPhotoForUploading {
  file: {
    uri: string;
    name: string;
    type: string;
  };
}

interface MappedSoundForUploading {
  uuid: string;
  file: {
    uri: string;
    name: string;
    type: string;
  }
}

interface MappedObservationSoundForAttaching {
  "observation_sound[observation_id]": number;
  "observation_sound[sound_id]": number;
  "observation_sound[uuid]": string;
}

interface ApiEndpoint {
  (
    params: MappedObservationPhotoForUpdating
      | MappedObservationPhotoForAttaching
      | MappedPhotoForUploading
      | MappedSoundForUploading
      | MappedObservationSoundForAttaching,
    options: UploadOptions
  ): Promise<MediaApiResponse>;
}

export type Evidence = RealmObservationPhoto | RealmObservationSound | RealmPhoto;

interface MediaItems {
  unsyncedObservationPhotos: RealmObservationPhoto[];
  modifiedObservationPhotos: RealmObservationPhoto[];
  unsyncedObservationSounds: RealmObservationSound[];
}

const uploadSingleEvidence = async (
  evidence: Evidence,
  type: EvidenceType,
  action: ActionType,
  observationId: number | null | undefined,
  apiEndpoint: ApiEndpoint,
  options: UploadOptions,
  observationUUID: string,
  realm: Realm
): Promise<MediaApiResponse | null> => {
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

  if ( !response ) {
    throw new Error( `Failed to upload ${type} ${evidenceUUID}: no response from server` );
  }

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

interface Operation {
  evidence: Evidence;
  type: EvidenceType;
  action: ActionType;
  observationId: number | null | undefined;
  apiEndpoint: ApiEndpoint;
}

async function processMediaOperations(
  operations: Operation[],
  options: UploadOptions,
  observationUUID: string,
  realm: Realm
): Promise<MediaApiResponse[]> {
  // use a single Promise.all instead of nested Promise.alls like we were doing before
  return Promise.all(
    operations.map( operation => uploadSingleEvidence(
      operation.evidence,
      operation.type,
      operation.action,
      operation.observationId,
      operation.apiEndpoint,
      options,
      observationUUID,
      realm
    ) )
  );
}

const filterMediaForUpload = ( observation: RealmObservation ): {
  unsyncedPhotos: RealmPhoto[];
  unsyncedObservationPhotos: RealmObservationPhoto[];
  modifiedObservationPhotos: RealmObservationPhoto[];
  unsyncedObservationSounds: RealmObservationSound[];
} => {
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
  } ).filter( Boolean ).flat() as RealmPhoto[];

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

const createMediaOperations = (
  mediaItems: {
    unsyncedPhotos?: RealmPhoto[] | null;
    unsyncedObservationPhotos?: RealmObservationPhoto[] | null;
    modifiedObservationPhotos?: RealmObservationPhoto[] | null;
    unsyncedObservationSounds?: RealmObservationSound[] | null;
  },
  observationUUID: string | undefined | null,
  uploadAction: boolean
) => {
  const operations: Operation[] = [];

  const unsyncedPhotos = mediaItems?.unsyncedPhotos || [];
  const unsyncedObservationPhotos = mediaItems?.unsyncedObservationPhotos || [];
  const modifiedObservationPhotos = mediaItems?.modifiedObservationPhotos || [];
  const unsyncedObservationSounds = mediaItems?.unsyncedObservationSounds || [];

  if ( uploadAction && unsyncedPhotos?.length > 0 ) {
    unsyncedPhotos.forEach( photo => {
      operations.push( {
        evidence: photo,
        type: "Photo" as EvidenceType,
        action: "upload" as ActionType,
        observationId: null,
        apiEndpoint: inatjs.photos.create
      } );
    } );
  }

  if ( uploadAction && unsyncedObservationSounds?.length > 0 ) {
    unsyncedObservationSounds.forEach( sound => {
      operations.push( {
        evidence: sound,
        type: "ObservationSound" as EvidenceType,
        action: "upload" as ActionType,
        observationId: null,
        apiEndpoint: inatjs.sounds.create
      } );
    } );
  }

  // Only add attach operations if we have an observation UUID
  if ( !uploadAction && observationUUID ) {
    if ( unsyncedObservationPhotos?.length > 0 ) {
      unsyncedObservationPhotos.forEach( obsPhoto => {
        operations.push( {
          evidence: obsPhoto,
          type: "ObservationPhoto" as EvidenceType,
          action: "attach" as ActionType,
          observationId: observationUUID as number,
          apiEndpoint: inatjs.observation_photos.create
        } );
      } );
    }

    if ( unsyncedObservationSounds?.length > 0 ) {
      unsyncedObservationSounds.forEach( obsSound => {
        operations.push( {
          evidence: obsSound,
          type: "ObservationSound" as EvidenceType,
          action: "attach" as ActionType,
          observationId: observationUUID as number,
          apiEndpoint: inatjs.observation_sounds.create
        } );
      } );
    }

    if ( modifiedObservationPhotos?.length > 0 ) {
      modifiedObservationPhotos.forEach( modifiedPhoto => {
        operations.push( {
          evidence: modifiedPhoto,
          type: "ObservationPhoto" as EvidenceType,
          action: "update" as ActionType,
          observationId: observationUUID as number,
          apiEndpoint: inatjs.observation_photos.update
        } );
      } );
    }
  }

  return operations;
};

async function uploadObservationMedia(
  observation: RealmObservation,
  options: UploadOptions,
  realm: Realm
): Promise<MediaItems> {
  if ( !observation?.observationPhotos && !observation?.observationSounds ) {
    return {
      unsyncedObservationPhotos: [],
      modifiedObservationPhotos: [],
      unsyncedObservationSounds: []
    };
  }

  const mediaItems = filterMediaForUpload( observation );

  // Create operations for just uploads (upload=true)
  const operations = createMediaOperations( mediaItems, null, true );

  if ( operations.length > 0 ) {
    await processMediaOperations( operations, options, observation.uuid, realm );
  }

  return {
    unsyncedObservationPhotos: mediaItems.unsyncedObservationPhotos,
    modifiedObservationPhotos: mediaItems.modifiedObservationPhotos,
    unsyncedObservationSounds: mediaItems.unsyncedObservationSounds
  };
}

async function attachMediaToObservation(
  observationUUID: string,
  mediaItems: MediaItems,
  options: UploadOptions,
  realm: Realm
): Promise<void> {
  // Make sure this happens *after* ObservationPhotos and ObservationSounds
  // are created so the observation doesn't appear uploaded until all its
  // media successfully uploads
  if ( !mediaItems.unsyncedObservationPhotos?.length
    && !mediaItems.modifiedObservationPhotos?.length
    && !mediaItems.unsyncedObservationSounds?.length ) {
    return;
  }

  // Create operations for just attachments (upload=false)
  const operations = createMediaOperations( mediaItems, observationUUID, false );

  // Process all operations in a single Promise.all
  if ( operations.length > 0 ) {
    await processMediaOperations( operations, options, observationUUID, realm );
  }
}

export {
  attachMediaToObservation,
  uploadObservationMedia
};
