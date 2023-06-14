import { EventRegister } from "react-native-event-listeners";

const emitUploadProgress = ( observationUUID, increment ) => {
  if ( !observationUUID ) { return; }
  EventRegister.emit(
    "INCREMENT_TOTAL_UPLOAD_PROGRESS",
    increment
  );
  EventRegister.emit(
    "INCREMENT_SINGLE_OBSERVATION_PROGRESS",
    [observationUUID, increment]
  );
};

export default emitUploadProgress;
