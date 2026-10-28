import { Alert } from "react-native";
import type { CameraRuntimeError } from "react-native-vision-camera";

import { log } from "../../../../react-native-logs.config";

const logger = log.extend( "CameraView" );

interface Event {
  log: string;
}

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
  handleLog,
};
