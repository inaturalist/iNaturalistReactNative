import { PHOTO_MAX_WIDTH } from "appConstants/photos";
import resizeImage from "sharedHelpers/resizeImage";

// Photos in photoUploads/ are kept at q100 to optimize cv
// for the upload image, we do more compression.
// With no outputPath the resizer writes to the OS cache folder
const UPLOAD_PHOTO_QUALITY = 90;

const compressPhotoForUpload = async ( uri: string ): Promise<string> => resizeImage( uri, {
  width: PHOTO_MAX_WIDTH,
  quality: UPLOAD_PHOTO_QUALITY,
  imageOptions: {
    mode: "contain",
    onlyScaleDown: true,
  },
} );

export default compressPhotoForUpload;
