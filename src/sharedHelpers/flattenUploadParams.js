import ImageResizer from "@bam.tech/react-native-image-resizer";
import { FileUpload } from "inaturalistjs";

const resizeImage = async (
  path: string,
  width: number,
  height?: number,
  outputPath?: string
): Promise<string> => {
  try {
    const { uri } = await ImageResizer.createResizedImage(
      path,
      width,
      height || width, // height
      "JPEG", // compressFormat
      100, // quality
      0, // rotation
      // $FlowFixMe
      outputPath, // outputPath
      true // keep metadata
    );

    return uri;
  } catch ( e ) {
    return "";
  }
};

const flattenUploadParams = async (
  uri: string,
  latitude: number,
  longitude: number
): Object => {
  const userImage = await resizeImage( uri, 299 );

  const params = {
    image: new FileUpload( {
      uri: userImage,
      name: "photo.jpeg",
      type: "image/jpeg"
    } )
  };
  if ( latitude ) {
    params.latitude = latitude;
  }
  if ( longitude ) {
    params.longitude = longitude;
  }
  return params;
};

export default flattenUploadParams;
