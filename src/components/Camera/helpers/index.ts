import { Alert } from "react-native";

import { log } from "../../../../react-native-logs.config";

const logger = log.extend( "CameraView" );

type Error = {
  message: string;
}

type Event = {
  log: string;
}

const handleClassifierError = ( error: Error ) => {
  // When we hit this error, there is an error with the classifier.
  logger.error( "handleClassifierError: ", error );
  Alert.alert( "error", error.message );
};

const handleDeviceNotSupported = ( error: Error ) => {
  // When we hit this error, something with the current device is not supported.
  Alert.alert( "error", error.message );
};

const handleCaptureError = ( error: Error ) => {
  // When we hit this error, taking a photo did not work correctly
  logger.error( "handleCaptureError: ", error );
  Alert.alert( "error", error.message );
};

const handleCameraError = ( error: Error ) => {
  // This error is thrown when it does not fit in any of the above categories.
  logger.error( "handleCameraError ", error );
  Alert.alert( "error", error.message );
};

const handleLog = ( event: Event ) => {
  logger.debug( event.log );
};

export {
  handleCameraError,
  handleCaptureError,
  handleClassifierError,
  handleDeviceNotSupported,
  handleLog
};
