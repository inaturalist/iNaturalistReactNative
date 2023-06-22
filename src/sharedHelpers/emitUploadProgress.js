import { EventRegister } from "react-native-event-listeners";

export const INCREMENT_SINGLE_UPLOAD_PROGRESS = "singleUploadProgress";

const emitUploadProgress = observationUUID => {
  if ( !observationUUID ) { return; }
  EventRegister.emit(
    INCREMENT_SINGLE_UPLOAD_PROGRESS,
    observationUUID
  );
};

export default emitUploadProgress;
