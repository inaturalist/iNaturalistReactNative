import { mkdir } from "@dr.pogodin/react-native-fs";
import { computerVisionPath } from "appConstants/paths";
import resizeImage from "sharedHelpers/resizeImage";

const CV_PHOTO_WIDTH = 640;
const CV_PHOTO_QUALITY = 100;

const resizeImageForComputerVision = async ( pathOrUri: string ): Promise<string> => {
  await mkdir( computerVisionPath );

  return resizeImage( pathOrUri, {
    width: CV_PHOTO_WIDTH,
    quality: CV_PHOTO_QUALITY,
    outputPath: computerVisionPath,
  } );
};

export default resizeImageForComputerVision;
