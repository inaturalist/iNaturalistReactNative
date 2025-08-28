import {
  rotatedOriginalPhotosPath
} from "appConstants/paths.ts";
import RNFS from "react-native-fs";
import type {
  CameraDevice,
  PhotoFile
} from "react-native-vision-camera";
import resizeImage from "sharedHelpers/resizeImage.ts";
import { unlink } from "sharedHelpers/util.ts";
import {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation.ts";

const savePhotoToDocumentsDirectory = async (
  cameraPhoto: PhotoFile,
  device: CameraDevice
) => {
  const path = rotatedOriginalPhotosPath;
  await RNFS.mkdir( path );

  // reconcile the photo's orientation with the sensor orientation to get a rotation value
  let photoRotation = 0;
  switch ( cameraPhoto.orientation ) {
    case LANDSCAPE_LEFT:
      photoRotation = 90;
      break;
    case LANDSCAPE_RIGHT:
      photoRotation = 270;
      break;
    case PORTRAIT_UPSIDE_DOWN:
      photoRotation = 180;
      break;
    case PORTRAIT:
    default:
      photoRotation = 0;
  }

  let sensorRotation = 0;
  switch ( device.sensorOrientation ) {
    case LANDSCAPE_LEFT:
      sensorRotation = 90;
      break;
    case LANDSCAPE_RIGHT:
      sensorRotation = 270;
      break;
    case PORTRAIT_UPSIDE_DOWN:
      sensorRotation = 180;
      break;
    case PORTRAIT:
    default:
      sensorRotation = 0;
  }

  let rotation = 0;
  if ( cameraPhoto.isMirrored ) {
    rotation = sensorRotation - photoRotation;
  } else {
    rotation = sensorRotation + photoRotation;
  }
  if ( rotation < 0 ) {
    rotation += 360;
  } else if ( rotation > 360 ) {
    rotation -= 360;
  }

  // Move and rotate the image with ImageResizer
  const image = await resizeImage(
    cameraPhoto.path,
    {
      width: cameraPhoto.width,
      height: cameraPhoto.height,
      outputPath: path,
      rotation
    }
  );
  // Remove original photo
  await unlink( cameraPhoto.path );
  return image;
};

export default savePhotoToDocumentsDirectory;
