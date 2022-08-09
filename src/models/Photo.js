import RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";
import Realm from "realm";

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
    const { photoUploadPath } = Photo;

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
      _created_at: new Date( ),
      _updated_at: new Date( ),
      localFilePath
    };
  }

  static displayLargePhoto( url ) {
    return url?.replace( "square", "large" );
  }

  static displayMediumPhoto( url ) {
    return url?.replace( "square", "medium" );
  }

  static displayLocalOrRemoteMediumPhoto( photo ) {
    return Photo.displayMediumPhoto( photo?.url ) || photo?.localFilePath;
  }

  static displayLocalOrRemoteSquarePhoto( photo ) {
    return photo?.url || photo?.localFilePath;
  }

  static deletePhotoFromDeviceStorage( path ) {
    const fileName = path.split( "photoUploads/" )[1];
    RNFS.unlink( `${Photo.photoUploadPath}/${fileName}` );
  }

  static async savePhoto( realm, cameraPhoto ) {
    const photo = await Photo.new( cameraPhoto.path );
    realm?.write( ( ) => {
      realm?.create( "Photo", photo );
    } );
    return photo.localFilePath;
  }

  static async deleteRemotePhoto( realm, uri ) {
    // right now it doesn't look like there's a way to delete a photo OR an observation photo from
    // api v2, so just going to worry about deleting locally for now
    const photoToDelete = realm.objects( "Photo" ).filtered( `url == "${uri}"` )[0];

    realm?.write( ( ) => {
      realm?.delete( photoToDelete );
    } );
  }

  static async deleteLocalPhoto( realm, uri ) {
    const photoToDelete = realm.objects( "Photo" ).filtered( `localFilePath == "${uri}"` )[0];

    // delete uri on disk
    Photo.deletePhotoFromDeviceStorage( uri );

    realm?.write( ( ) => {
      realm?.delete( photoToDelete );
    } );
  }

  static async deletePhoto( realm, uri ) {
    if ( uri.includes( "https://" ) ) {
      Photo.deleteRemotePhoto( realm, uri );
    } else {
      Photo.deleteLocalPhoto( realm, uri );
    }
  }

  static schema = {
    name: "Photo",
    // TODO: need uuid to be primary key for photos that get uploaded?
    properties: {
      // datetime the photo was created on the device
      _created_at: "date?",
      // datetime the photo was last synced with the server
      _synced_at: "date?",
      // datetime the photo was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      id: "int?",
      attribution: "string?",
      license_code: { type: "string?", mapTo: "licenseCode" },
      url: "string?",
      localFilePath: "string?"
    }
  }
}

export default Photo;
