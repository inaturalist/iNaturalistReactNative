import ImageResizer from "@bam.tech/react-native-image-resizer";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "resizeImage" );

const resizeImage = async (
  path: string,
  options: {
    width: number,
    height?: number,
    rotation?: number,
    outputPath?: string,
    imageOptions?: {
      mode?: string,
      onlyScaleDown?: boolean
    }
  }
): Promise<string> => {
  const {
    width,
    height,
    rotation,
    outputPath,
    imageOptions
  } = options;
  // Note that the default behavior of this library is to resize to contain,
  // i.e. it will not adjust aspect ratio
  const { uri } = await ImageResizer.createResizedImage(
    path,
    width, // maxWidth
    height || width, // maxHeight
    "JPEG", // compressFormat
    100, // quality
    rotation || 0, // rotation
    outputPath, // outputPath
    true, // keep metadata,
    imageOptions // mode and scale options
  );

  logger.info( "resized image: ", uri );
  return uri;
};

export default resizeImage;
