import { Alert } from "react-native";
import { log } from "../../../../react-native-logs.config";

const logger = log.extend("CameraView");

type Error = {
  message: string;
}

type Event = {
  log: string;
}

const handleClassifierError = (error: Error) => {
  // When we hit this error, there is an error with the classifier.
  logger.info(`handleClassifierError: ${error.message}`);
  Alert.alert("error", error.message);
};

const handleDeviceNotSupported = (error: Error) => {
  // When we hit this error, something with the current device is not supported.
  logger.info(`handleDeviceNotSupported: ${error.message}`);
  Alert.alert("error", error.message);
};

const handleCaptureError = (error: Error) => {
  // When we hit this error, taking a photo did not work correctly
  logger.info(`handleCaptureError: ${error.message}`);
  Alert.alert("error", error.message);
};

const handleCameraError = (error: Error) => {
  // This error is thrown when it does not fit in any of the above categories.
  logger.info(`handleCameraError: ${error.message}`);
  Alert.alert("error", error.message);
};

const handleLog = (event: Event) => {
  logger.info(event.log);
};

export {
  handleClassifierError,
  handleDeviceNotSupported,
  handleCaptureError,
  handleCameraError,
  handleLog,
};
