import { mkdir } from "@dr.pogodin/react-native-fs";
import { computerVisionPath } from "appConstants/paths";
import { Platform } from "react-native";
import resizeImage from "sharedHelpers/resizeImage";

const CV_PHOTO_WIDTH = 640;
const CV_PHOTO_QUALITY = 100;

const resizeImageForComputerVision = async ( pathOrUri: string ): Promise<string> => {
  await mkdir( computerVisionPath );

  // Work around path / uri bug: https://github.com/bamlab/react-native-image-resizer/issues/328
  let uriForResize = pathOrUri;
  if ( Platform.OS === "ios" && uriForResize.match( /^\// ) ) {
    uriForResize = `file://${uriForResize}`;
  }

  return resizeImage( uriForResize, {
    width: CV_PHOTO_WIDTH,
    quality: CV_PHOTO_QUALITY,
    outputPath: computerVisionPath,
  } );
};

export default resizeImageForComputerVision;
