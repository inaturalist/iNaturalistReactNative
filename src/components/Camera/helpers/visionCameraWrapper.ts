// This wraps the react-native-vision-camera component and methods we use,
// so we can mock them for e2e tests in simulators without camera.
import {
  Camera,
  useAsyncRunner,
  useCameraDevice,
  useCameraDevices,
  useFrameOutput,
  usePhotoOutput,
} from "react-native-vision-camera";

export {
  Camera,
  useAsyncRunner,
  useCameraDevice,
  useCameraDevices,
  useFrameOutput,
  usePhotoOutput,
};
