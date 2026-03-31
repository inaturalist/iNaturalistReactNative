import {
  rotatedOriginalPhotosPath,
} from "appConstants/paths";
import RNFS from "react-native-fs";
import type {
  PhotoFile,
} from "react-native-vision-camera";

const savePhotoToDocumentsDirectory = async (
  cameraPhoto: PhotoFile,
) => {
  const path = rotatedOriginalPhotosPath;
  await RNFS.mkdir( path );
  const filename = cameraPhoto.path.split( "/" ).at( -1 );
  const newPath = `file://${path}/${filename}`;
  await RNFS.moveFile( cameraPhoto.path, newPath );
  return newPath;
};

export default savePhotoToDocumentsDirectory;
