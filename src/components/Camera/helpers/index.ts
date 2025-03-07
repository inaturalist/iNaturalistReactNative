import { Alert } from "react-native";
import { CameraRuntimeError } from "react-native-vision-camera";

import { log } from "../../../../react-native-logs.config";

const logger = log.extend( "CameraView" );

type Event = {
  log: string;
}

const handleClassifierError = ( error: CameraRuntimeError ) => {
  // When we hit this error, there is an error with the classifier.
  logger.error( "handleClassifierError: ", JSON.stringify( error ) );
  Alert.alert( "error", JSON.stringify( error ) );
};

const handleDeviceNotSupported = ( error: CameraRuntimeError ) => {
  // When we hit this error, something with the current device is not supported.
  Alert.alert( "error", JSON.stringify( error ) );
};

const handleCaptureError = ( error: CameraRuntimeError ) => {
  // When we hit this error, taking a photo did not work correctly
  logger.error( "handleCaptureError: ", JSON.stringify( error ) );
  Alert.alert( "error", JSON.stringify( error ) );
};

const handleCameraError = ( error: CameraRuntimeError ) => {
  // This error is thrown when it does not fit in any of the above categories.
  logger.error( "handleCameraError ", JSON.stringify( error ) );
  Alert.alert( "error", JSON.stringify( error ) );
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
