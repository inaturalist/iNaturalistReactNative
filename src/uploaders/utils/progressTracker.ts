import { EventRegister } from "react-native-event-listeners";

export const INCREMENT_SINGLE_UPLOAD_PROGRESS = "singleUploadProgress";
export const UPLOAD_PROGRESS_INCREMENT = 1;
export const HALF_INCREMENT = UPLOAD_PROGRESS_INCREMENT / 2;

function emitProgress(
  observationUUID: string,
  increment: number,
) {
  if ( !observationUUID ) {
    console.warn( "Attempted to emit progress for undefined observationUUID" );
    return;
  }
  EventRegister.emit(
    INCREMENT_SINGLE_UPLOAD_PROGRESS,
    [observationUUID, increment],
  );
}

function trackObservationUpload( observationUUID: string ) {
  return {
    start: () => emitProgress( observationUUID, HALF_INCREMENT ),
    complete: () => emitProgress( observationUUID, HALF_INCREMENT ),
  };
}

function trackEvidenceUpload( observationUUID: string ) {
  return {
    uploaded: () => emitProgress( observationUUID, HALF_INCREMENT ),
    attached: () => emitProgress( observationUUID, HALF_INCREMENT ),
  };
}

export {
  emitProgress,
  trackEvidenceUpload,
  trackObservationUpload,
};
