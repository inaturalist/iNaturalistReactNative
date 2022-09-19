import { createResizedImage } from "@bam.tech/react-native-image-resizer";
import { Platform } from "react-native";
import RNFS from "react-native-fs";
import Realm from "realm";

class Photo extends Realm.Object {
  static PHOTO_FIELDS = {
    id: true,
    attribution: true,
    license_code: true,
    url: true
  };

  static photoUploadPath = `${RNFS.DocumentDirectoryPath}/photoUploads`;

  static mapApiToRealm( photo, existingObsPhoto ) {
    const localPhoto = {
      ...photo,
      _synced_at: new Date( )
    };
    if ( !existingObsPhoto ) {
      localPhoto._created_at = new Date( );
    }
    return localPhoto;
  }

  static async resizeImageForUpload( pathOrUri ) {
    const width = 2048;
    const { photoUploadPath } = Photo;
    await RNFS.mkdir( photoUploadPath );
    let outFilename = pathOrUri.split( "/" ).slice( -1 ).pop( );

    // If pathOrUri is an ios localIdentifier, make up a filename based on that
    const iosLocalIdentifierMatches = pathOrUri.match( /^ph:\/\/([^/]+)/ );
    if ( iosLocalIdentifierMatches ) {
      outFilename = `${iosLocalIdentifierMatches[1]}.jpeg`;
    }
    const outPath = `${photoUploadPath}/${outFilename}`;

    // If pathOrUri is an ios localIdentifier, we don't have an actual local
    // file path that react-native-image-resizer can use, so instead we're
    // using react-native-fs resizing. If consistency becomes a problem, we
    // could instead use RNFS to copy the file locally and then resize it
    // with the resizer.
    if ( Platform.OS === "ios" && pathOrUri.match( /^ph:/ ) ) {
      const outUri = await RNFS.copyAssetsFileIOS( pathOrUri, outPath, width, width );
      return outUri;
    }

    try {
      const { uri } = await createResizedImage(
        pathOrUri,
        width,
        width, // height
        "JPEG", // compressFormat
        100, // quality
        0, // rotation
        photoUploadPath,
        true, // keep metadata
        {
          mode: "contain",
          onlyScaleDown: true
        }
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

  static deletePhotoFromDeviceStorage( photoPath ) {
    const fileName = photoPath.split( "photoUploads/" )[1];
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
