import type { ExifTags } from "@lodev09/react-native-exify";
import * as Exify from "@lodev09/react-native-exify";
import { photoUploadPath } from "appConstants/paths";
import { Images } from "react-native-nitro-image";
import Photo from "realmModels/Photo";
import type { CropRectangle } from "sharedHelpers/getCropRectangle";
import { log } from "sharedHelpers/logger";
import * as uuid from "uuid";

const logger = log.extend( "editLocalPhoto" );

export type PhotoRotation = 0 | 90 | 180 | 270;

export interface PhotoEdits {
  // Degrees clockwise. Applied before cropping
  rotation: PhotoRotation;
  // In pixels of the image after rotation
  cropRectangle?: CropRectangle;
}

// Capture details worth keeping, plus every GPS* tag. Anything describing the
// old pixels (orientation, dimensions, thumbnail) is left behind
const COPIED_EXIF_TAGS = [
  "DateTime",
  "DateTimeOriginal",
  "DateTimeDigitized",
  "OffsetTime",
  "OffsetTimeOriginal",
  "OffsetTimeDigitized",
  "SubsecTimeOriginal",
  "SubsecTimeDigitized",
  "Make",
  "Model",
  "LensMake",
  "LensModel",
  "Software",
  "Artist",
  "Copyright",
  "ExposureTime",
  "FNumber",
  "ISOSpeedRatings",
  "FocalLength",
  "FocalLenIn35mmFilm",
  "Flash",
];

export const pickExifToCopy = ( source: ExifTags ): ExifTags => Object.fromEntries(
  Object.entries( source ).filter(
    ( [key] ) => key.startsWith( "GPS" ) || COPIED_EXIF_TAGS.includes( key ),
  ),
);

// Exify needs file:// URIs, not bare paths
const copyExif = async ( fromUri: string, toUri: string ) => {
  try {
    const source = await Exify.read( fromUri );
    if ( !source ) return;
    const tags = pickExifToCopy( source );
    if ( Object.keys( tags ).length === 0 ) return;
    await Exify.write( toUri, tags );
  } catch ( error ) {
    // Losing metadata is better than losing the edit
    logger.error( "Failed to copy EXIF to edited photo", error );
  }
};

// Applies edits to a photo in photoUploads and saves the result as a new file
// there, leaving the original untouched so a cancelled edit can fall back to
// it. nitro-image writes no metadata, so EXIF is copied over from the original.
// Returns the new file's path for Photo.localFilePath
const editLocalPhoto = async (
  localFilePath: string,
  { rotation, cropRectangle }: PhotoEdits,
): Promise<string> => {
  const sourceUri = Photo.getLocalPhotoUri( localFilePath );
  if ( !sourceUri ) {
    throw new Error( `editLocalPhoto: not a photoUploads path: ${localFilePath}` );
  }
  // nitro-image takes file paths, not file:// URIs
  const source = await Images.loadFromFileAsync( sourceUri.replace( /^file:\/\//, "" ) );

  // Always redraw, even at 0°, so the pixels are upright: iOS crops the raw
  // pixels and would ignore an EXIF orientation flag
  let image = await source.rotateAsync( rotation, false );
  if ( cropRectangle ) {
    const {
      startX, startY, endX, endY,
    } = cropRectangle;
    image = await image.cropAsync( startX, startY, endX, endY );
  }

  // A new filename, so cached images and suggestions for the old file are not reused
  const editedPath = `${photoUploadPath}/${uuid.v4( )}.jpg`;
  await image.saveToFileAsync( editedPath, "jpg", 100 );
  await copyExif( sourceUri, `file://${editedPath}` );
  return editedPath;
};

export default editLocalPhoto;
