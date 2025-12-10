import ImageResizer from "@bam.tech/react-native-image-resizer";

const resizeImage = async (
  pathOrUri: string,
  options: {
    width: number;
    height?: number;
    rotation?: number;
    outputPath?: string;
    imageOptions?: {
      mode?: string;
      onlyScaleDown?: boolean;
    };
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
  const resizedPhoto = await ImageResizer.createResizedImage(
    pathOrUri,
    width, // maxWidth
    height || width, // maxHeight
    "JPEG", // compressFormat
    100, // quality
    rotation || 0, // rotation
    outputPath, // outputPath
    true, // keep metadata,
    imageOptions // mode and scale options
  );

  const { uri } = resizedPhoto;

  return uri;
};

export default resizeImage;
