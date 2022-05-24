import Realm from "realm";
import ImageResizer from "react-native-image-resizer";
import RNFS from "react-native-fs";

class Photo extends Realm.Object {
  static PHOTO_FIELDS = {
    id: true,
    attribution: true,
    license_code: true,
    url: true
  };

  static photoUploadPath = `${RNFS.DocumentDirectoryPath}/photoUploads`;

  static mapApiToRealm( photo ) {
    return photo;
  }

  static async resizeImageForUpload( path ) {
    const width = 2048;
    const photoUploadPath = Photo.photoUploadPath;

    await RNFS.mkdir( photoUploadPath );
    try {
      const { uri } = await ImageResizer.createResizedImage(
        path,
        width,
        width, // height
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
  }

  static async new( uri ) {
    const localFilePath = await Photo.resizeImageForUpload( uri );

    return {
      localFilePath
    };
  }

  static displayLocalOrRemotePhoto( p ) {
    return p.photo?.url || p?.photo?.localFilePath;
  }

  static deleteLocalImage( path ) {
    const fileName = path.split( "photoUploads/" )[1];
    RNFS.unlink( `${Photo.photoUploadPath}/${fileName}` );
  }

  static schema = {
    name: "Photo",
    // TODO: need uuid to be primary key for photos that get uploaded?
    properties: {
      id: "int?",
      attribution: "string?",
      license_code: { type: "string?", mapTo: "licenseCode" },
      url: "string?",
      localFilePath: "string?"
    }
  }
}

export default Photo;
