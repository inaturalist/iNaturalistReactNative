import type {
  PhotoFile
} from "react-native-vision-camera";
import {
  rotatePhotoPatch
} from "sharedHelpers/visionCameraPatches";

// Rotate the original photo depending on device orientation
const savePhotoToDocumentsDirectory = async (
  cameraPhoto: PhotoFile
) => rotatePhotoPatch( cameraPhoto );

export default savePhotoToDocumentsDirectory;
