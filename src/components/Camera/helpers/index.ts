import { Alert } from "react-native";

import { log } from "../../../../react-native-logs.config";

const logger = log.extend( "CameraView" );

interface Event {
  log: string;
}

const handleClassifierError = ( error: Error ) => {
  // When we hit this error, there is an error with the classifier.
  const message = error?.message || String( error );
  logger.error( "handleClassifierError: ", message );
  Alert.alert( "error", message );
};

const handleCameraError = ( error: Error ) => {
  // This error is thrown when it does not fit in any of the above categories.
  const message = error?.message || String( error );
  logger.error( "handleCameraError ", message );
  Alert.alert( "error", message );
};

const handleLog = ( event: Event ) => {
  logger.debug( event.log );
};

export {
  handleCameraError,
  handleClassifierError,
  handleLog,
};
