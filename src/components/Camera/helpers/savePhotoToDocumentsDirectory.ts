import { mkdir, moveFile } from "@dr.pogodin/react-native-fs";
import {
  rotatedOriginalPhotosPath,
} from "appConstants/paths";
import type {
  PhotoFile,
} from "react-native-vision-camera";

const savePhotoToDocumentsDirectory = async (
  cameraPhoto: PhotoFile,
) => {
  const path = rotatedOriginalPhotosPath;
  await mkdir( path );
  const filename = cameraPhoto.path.split( "/" ).at( -1 );
  const newPath = `file://${path}/${filename}`;
  await moveFile( cameraPhoto.path, newPath );
  return newPath;
};

export default savePhotoToDocumentsDirectory;
