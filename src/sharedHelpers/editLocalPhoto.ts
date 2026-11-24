import { photoUploadPath } from "appConstants/paths";
import { Images } from "react-native-nitro-image";
import Photo from "realmModels/Photo";
import type { CropRectangle } from "sharedHelpers/getCropRectangle";
import * as uuid from "uuid";

export type PhotoRotation = 0 | 90 | 180 | 270;

export interface PhotoEdits {
  // Degrees clockwise. Applied before cropping
  rotation: PhotoRotation;
  // In pixels of the image after rotation
  cropRectangle?: CropRectangle;
}

// Applies edits to a photo in photoUploads and saves the result as a new file
// there, leaving the original untouched so a cancelled edit can fall back to
// it. Returns the new file's path for Photo.localFilePath
const editLocalPhoto = async (
  localFilePath: string,
  { rotation, cropRectangle }: PhotoEdits,
): Promise<string> => {
  const sourceUri = Photo.getLocalPhotoUri( localFilePath );
  if ( !sourceUri ) {
    throw new Error( `editLocalPhoto: not a photoUploads path: ${localFilePath}` );
  }
  // nitro-image takes file paths, not file:// URIs
  let image = await Images.loadFromFileAsync( sourceUri.replace( /^file:\/\//, "" ) );

  if ( rotation !== 0 ) {
    // Rotate the pixels, not just the EXIF orientation flag: iOS crops the
    // raw pixels and would ignore the flag
    image = await image.rotateAsync( rotation, false );
  }
  if ( cropRectangle ) {
    const {
      startX, startY, endX, endY,
    } = cropRectangle;
    image = await image.cropAsync( startX, startY, endX, endY );
  }

  // A new filename, so cached images and suggestions for the old file are not reused
  const editedPath = `${photoUploadPath}/${uuid.v4( )}.jpg`;
  await image.saveToFileAsync( editedPath, "jpg", 100 );
  return editedPath;
};

export default editLocalPhoto;
