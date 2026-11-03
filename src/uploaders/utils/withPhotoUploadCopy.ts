import { mkdir } from "@dr.pogodin/react-native-fs";
import { photoUploadCopiesPath } from "appConstants/paths";
import { PHOTO_MAX_WIDTH, UPLOAD_PHOTO_QUALITY } from "appConstants/photos";
import Photo from "realmModels/Photo";
import { log } from "sharedHelpers/logger";
import resizeImage from "sharedHelpers/resizeImage";
import { unlink } from "sharedHelpers/util";

const logger = log.extend( "withPhotoUploadCopy" );

const makeUploadCopy = async ( localUri: string ): Promise<string> => {
  await mkdir( photoUploadCopiesPath );
  return resizeImage( localUri, {
    width: PHOTO_MAX_WIDTH,
    quality: UPLOAD_PHOTO_QUALITY,
    outputPath: photoUploadCopiesPath,
    imageOptions: {
      mode: "contain",
      onlyScaleDown: true,
    },
  } );
};

// Makes a q90 copy of a stored photo, hands its uri to `upload`, and always
// deletes the copy afterwards. The copy never outlives this call, so nothing
// else (Realm, display, cleanup keep-lists) ever sees it. If the copy can't be
// made, the stored photo is uploaded instead so an optimization never blocks
// an upload.
const withPhotoUploadCopy = async <T>(
  localFilePath: string | undefined,
  upload: ( uri: string ) => Promise<T>,
): Promise<T> => {
  const localUri = Photo.getLocalPhotoUri( localFilePath );
  if ( !localUri ) {
    throw new Error( "Cannot upload photo: it has no local file" );
  }

  let copyUri: string | null = null;
  try {
    copyUri = await makeUploadCopy( localUri );
  } catch ( copyError ) {
    logger.warn( "Could not make upload copy, uploading the stored photo instead", copyError );
  }

  try {
    return await upload( copyUri ?? localUri );
  } finally {
    if ( copyUri ) {
      await unlink( copyUri ).catch( unlinkError => {
        logger.warn( "Could not delete upload copy", unlinkError );
      } );
    }
  }
};

export default withPhotoUploadCopy;
