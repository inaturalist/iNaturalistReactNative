import ImageResizer from "react-native-image-resizer";
import RNFS from "react-native-fs";

const photoUploadPath = `${RNFS.DocumentDirectoryPath}/photoUploads`;

const resizeImage = async ( path, width, height? ) => {
  console.log( path, "path for resizing image, android" );
  try {
    const { uri } = await ImageResizer.createResizedImage(
      path,
      width,
      height || width, // height
      "JPEG", // compressFormat
      100, // quality
      0, // rotation
      // $FlowFixMe
      photoUploadPath,
      true // keep metadata
    );

    return uri;
  } catch ( e ) {
    console.log( e, "error resizing image" );
    return "";
  }
};

const resizeImageForUpload = async ( uri ) => {
  const maxUploadSize = 2048;
  return await resizeImage( uri, maxUploadSize, maxUploadSize );
};

export default resizeImageForUpload;
