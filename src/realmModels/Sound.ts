import { mkdir, moveFile } from "@dr.pogodin/react-native-fs";
import { Realm } from "@realm/react";
import type { ApiSound } from "api/types";
import { soundUploadPath } from "appConstants/paths";
import { unlink } from "sharedHelpers/util";
import * as uuid from "uuid";

class Sound extends Realm.Object {
  static SOUND_FIELDS = {
    id: true,
    attribution: true,
    license_code: true,
    file_url: true,
  } as const;

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
      file_url: "string?",
    },
  };

  static mapApiToRealm( sound: ApiSound, _realm = null ) {
    const localSound = {
      ...sound,
      _synced_at: new Date( ),
    };
    localSound.licenseCode = localSound.licenseCode || sound?.license_code;
    return localSound;
  }

  static async moveFromCacheToDocumentDirectory(
    srcPath: string,
    options: { basename: string },
  ) {
    const srcFileName = srcPath.split( "/" ).at( -1 );
    const srcFileExt = srcFileName.split( "." ).at( -1 );
    const fileName = `${options.basename}.${srcFileExt}`;
    await mkdir( soundUploadPath );
    const dstPath = `${soundUploadPath}/${fileName}`;

    await moveFile( srcPath, dstPath );
    return dstPath;
  }

  static async new( uri: string ) {
    /* eslint-disable camelcase */
    let file_url = uri;
    if ( uri.match( /file:\/\// ) ) {
      file_url = await Sound.moveFromCacheToDocumentDirectory( uri, {
        basename: uuid.v4( ),
      } );
      // this needs a protocol for the sound player to play it when it's local
      file_url = `file://${file_url}`;
    }
    return {
      file_url,
    };
    /* eslint-enable camelcase */
  }

  // this is necessary because sounds, like photos, cannot be found reliably
  // without this, local sounds will not be available for upload when the app updates
  static getLocalSoundUri( localPathOrUri?: string ) {
    const pieces = localPathOrUri?.split( "soundUploads/" );
    if ( !pieces || pieces.length <= 1 ) return null;
    return `file://${soundUploadPath}/${pieces[1]}`;
  }

  static deleteSoundFromDeviceStorage( path: string ) {
    const localSound = Sound.getLocalSoundUri( path );
    unlink( localSound );
  }

  // An unpleasant hack around another unpleasant hack, i.e. when we "need" to
  // convert Realm objects to JSON and we apparently lose attributions
  // defined with mapTo
  toJSON( ) {
    const json = super.toJSON( );
    return {
      ...json,
      licenseCode: json.license_code,
    };
  }
}

export default Sound;
