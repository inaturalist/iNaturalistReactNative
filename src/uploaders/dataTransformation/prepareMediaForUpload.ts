import ObservationPhoto from "realmModels/ObservationPhoto";
import ObservationSound from "realmModels/ObservationSound";

function prepareMediaForUpload(
  media: object,
  type: string,
  action: "upload" | "attach" | "update",
  observationId?: number | null
): object {
  if ( type === "Photo" || type === "ObservationPhoto" ) {
    if ( action === "upload" ) {
      return ObservationPhoto.mapPhotoForUpload( media );
    }
    if ( action === "attach" ) {
      return ObservationPhoto
        .mapPhotoForAttachingToObs( observationId, media );
    }
    if ( action === "update" ) {
      return ObservationPhoto.mapPhotoForUpdating( observationId, media );
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
