import { computerVisionPath } from "appConstants/paths";
import { FileUpload } from "inaturalistjs";
import resizeImageForComputerVision from "sharedHelpers/resizeImageForComputerVision";

interface FlattenUploadArgs {
  image: {
    uri: string;
    name: string;
    type: string;
  };
}

const flattenUploadParams = async ( uri: string ): Promise<FlattenUploadArgs> => {
  const uploadUri = uri.includes( computerVisionPath )
    ? uri
    : await resizeImageForComputerVision( uri );

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
