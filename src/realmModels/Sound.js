import { Realm } from "@realm/react";
import { soundUploadPath } from "appConstants/paths";
import RNFS from "react-native-fs";
import { unlink } from "sharedHelpers/util";
import * as uuid from "uuid";

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
    await RNFS.mkdir( soundUploadPath );
    const dstPath = `${soundUploadPath}/${fileName}`;

    await RNFS.moveFile( srcPath, dstPath );
    return dstPath;
  }

  static async new( sound ) {
    /* eslint-disable camelcase */
    let { file_url } = sound;
    if ( sound?.file_url.match( /file:\/\// ) ) {
      file_url = await Sound.moveFromCacheToDocumentDirectory( sound.file_url, {
        basename: uuid.v4()
      } );
      // this needs a protocol for the sound player to play it when it's local
      file_url = `file://${file_url}`;
    }
    return {
      ...sound,
      file_url
    };
    /* eslint-enable camelcase */
  }

  // this is necessary because sounds, like photos, cannot be found reliably
  // without this, local sounds will not be available for upload when the app updates
  static getLocalSoundUri( localPathOrUri ) {
    const pieces = localPathOrUri?.split( "soundUploads/" );
    if ( !pieces || pieces.length <= 1 ) return null;
    return `file://${soundUploadPath}/${pieces[1]}`;
  }

  static deleteSoundFromDeviceStorage( path ) {
    unlink( path );
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
