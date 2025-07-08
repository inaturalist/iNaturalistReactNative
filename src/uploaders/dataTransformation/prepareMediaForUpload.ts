import ObservationPhoto from "realmModels/ObservationPhoto";
import ObservationSound from "realmModels/ObservationSound";
import { ActionType, Evidence, EvidenceType } from "uploaders/mediaUploader.ts";

function prepareMediaForUpload(
  media: Evidence,
  type: EvidenceType,
  action: ActionType,
  observationId?: number | null
): object {
  if ( type === "Photo" || type === "ObservationPhoto" ) {
    if ( action === "upload" ) {
      return ObservationPhoto.mapPhotoForUpload( media );
    }
    if ( action === "attach" ) {
      // Assert inputs
      if ( !observationId ) {
        throw new Error( "Observation ID is required for attaching photos" );
      }
      const mappedObservationPhoto = ObservationPhoto
        .mapPhotoForAttachingToObs( observationId, media );
      // Assert outputs
      // Remove position key if not a number (API will throw an error if "position" key is present
      // but is not a number)
      if ( typeof mappedObservationPhoto.observation_photo.position !== "number" ) {
        delete mappedObservationPhoto.observation_photo.position;
      }
      return mappedObservationPhoto;
    }
    if ( action === "update" ) {
      // Assert inputs
      if ( !observationId ) {
        throw new Error( "Observation ID is required for updating photos" );
      }
      const mappedObservationPhoto = ObservationPhoto
        .mapPhotoForUpdating( observationId, media );
      // Assert outputs
      // Remove position key if not a number (API will throw an error if "position" key is present
      // but is not a number)
      if ( typeof mappedObservationPhoto.observation_photo.position !== "number" ) {
        delete mappedObservationPhoto.observation_photo.position;
      }
      return mappedObservationPhoto;
    }
  } else if ( type === "ObservationSound" ) {
    if ( action === "upload" ) {
      return ObservationSound.mapSoundForUpload( observationId, media );
    }
    if ( action === "attach" ) {
      return ObservationSound
        .mapSoundForAttachingToObs( observationId, media );
    }
  }
  throw new Error( `Unsupported media type (${type}) or action (${action})` );
}

export default prepareMediaForUpload;
