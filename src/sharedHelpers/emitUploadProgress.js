import { EventRegister } from "react-native-event-listeners";

export const INCREMENT_MULTIPLE_UPLOAD_PROGRESS = "multipleUploadProgress";
export const INCREMENT_SINGLE_UPLOAD_PROGRESS = "singleUploadProgress";

const emitUploadProgress = ( observationUUID, increment ) => {
  if ( !observationUUID ) { return; }
  EventRegister.emit(
    INCREMENT_MULTIPLE_UPLOAD_PROGRESS,
    increment
  );
  EventRegister.emit(
    INCREMENT_SINGLE_UPLOAD_PROGRESS,
    [observationUUID, increment]
  );
};

export default emitUploadProgress;
