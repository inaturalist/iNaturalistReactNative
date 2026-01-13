import { computerVisionPath } from "appConstants/paths";
import { FileUpload } from "inaturalistjs";
import RNFS from "react-native-fs";
import resizeImage from "sharedHelpers/resizeImage";

const outputPath = computerVisionPath;

interface FlattenUploadArgs {
  image: {
    uri: string;
    name: string;
    type: string;
  };
}

const flattenUploadParams = async (
  uri: string,
): Promise<FlattenUploadArgs> => {
  await RNFS.mkdir( outputPath );
  const uploadUri = await resizeImage( uri, {
    // this max width/height is the same as the legacy Android app
    // we always want the width/height to be bigger than 299x299
    // and want to preserve the aspect ratio (not crunch the image down into a square)
    // for the best results
    width: 640,
    outputPath,
  } );

  const params: FlattenUploadArgs = {
    image: new FileUpload( {
      uri: uploadUri,
      name: "photo.jpeg",
      type: "image/jpeg",
    } ),
  };

  return params;
};

export default flattenUploadParams;
