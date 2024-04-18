import { Realm } from "@realm/react";
import RNFS from "react-native-fs";
import uuid from "react-native-uuid";

const SOUND_UPLOADS_DIRNAME = "soundUploads";
const SOUND_UPLOADS_PATH = `${RNFS.DocumentDirectoryPath}/${SOUND_UPLOADS_DIRNAME}`;

class Sound extends Realm.Object {
  static SOUND_FIELDS = {
    id: true,
    attribution: true,
    license_code: true,
    file_url: true
  };

  static schema = {
    name: "Sound",
    embedded: true,
    properties: {
      // datetime the photo was created on the device
      _created_at: "date?",
      // datetime the photo was last synced with the server
      _synced_at: "date?",
      // datetime the photo was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      id: "int?",
      attribution: "string?",
      license_code: { type: "string", mapTo: "licenseCode", optional: true },
      file_url: "string?"
    }
  };

  static mapApiToRealm( sound, _realm = null ) {
    const localSound = {
      ...sound,
      _synced_at: new Date( )
    };
    localSound.licenseCode = localSound.licenseCode || sound?.license_code;
    return localSound;
  }

  static async moveFromCacheToDocumentDirectory( srcPath, options = {} ) {
    const srcFileName = srcPath.split( "/" ).at( -1 );
    const srcFileExt = srcFileName.split( "." ).at( -1 );
    let fileName = srcFileName;
    if ( options.basename ) {
      fileName = `${options.basename}.${srcFileExt}`;
    }
    await RNFS.mkdir( SOUND_UPLOADS_PATH );
    const dstPath = `${SOUND_UPLOADS_PATH}/${fileName}`;

    await RNFS.moveFile( srcPath, dstPath );
    return dstPath;
  }

  static async new( sound ) {
    const soundUUID = uuid.v4( );
    /* eslint-disable camelcase */
    let { file_url } = sound;
    if ( sound?.file_url.match( /file:\/\// ) ) {
      file_url = await Sound.moveFromCacheToDocumentDirectory( sound.file_url, {
        basename: soundUUID
      } );
      // this needs a protocol for the sound player to play it when it's local
      file_url = `file://${file_url}`;
    }
    return {
      ...sound,
      uuid: soundUUID,
      file_url
    };
  }

  static deleteSoundFromDeviceStorage( path ) {
    RNFS.exists( path ).then( fileExists => {
      if ( fileExists ) RNFS.unlink( path );
    } );
  }

  // An unpleasant hack around another unpleasant hack, i.e. when we "need" to
  // convert Realm objects to JSON and we apparently lose attributions
  // defined with mapTo
  toJSON( ) {
    const json = super.toJSON( );
    return {
      ...json,
      licenseCode: json.license_code
    };
  }
}

export default Sound;
