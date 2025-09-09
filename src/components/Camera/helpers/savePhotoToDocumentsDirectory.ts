import {
  rotatedOriginalPhotosPath
} from "appConstants/paths";
import RNFS from "react-native-fs";
import type {
  PhotoFile
} from "react-native-vision-camera";
import resizeImage from "sharedHelpers/resizeImage";
import { unlink } from "sharedHelpers/util";

const savePhotoToDocumentsDirectory = async (
  cameraPhoto: PhotoFile
) => {
  const path = rotatedOriginalPhotosPath;
  await RNFS.mkdir( path );
  // Move the image with ImageResizer (for legacy reasons, because we
  // used to use it to rotate the photo)
  const image = await resizeImage(
    cameraPhoto.path,
    {
      width: cameraPhoto.width,
      height: cameraPhoto.height,
      outputPath: path
    }
  );
  // Remove original photo
  await unlink( cameraPhoto.path );
  return image;
};

export default savePhotoToDocumentsDirectory;
