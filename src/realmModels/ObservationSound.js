import { Realm } from "@realm/react";
import { FileUpload } from "inaturalistjs";
import { Platform } from "react-native";
import RNFS from "react-native-fs";
import uuid from "react-native-uuid";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const SOUND_UPLOADS_DIRNAME = "soundUploads";
const SOUND_UPLOADS_PATH = `${RNFS.DocumentDirectoryPath}/${SOUND_UPLOADS_DIRNAME}`;

class ObservationSound extends Realm.Object {
  static OBSERVATION_SOUNDS_FIELDS = {
    id: true,
    uuid: true,
    sound: {
      id: true,
      file_url: true
    }
  };

  needsSync( ) {
    return !this._synced_at || this._synced_at <= this._updated_at;
  }

  wasSynced( ) {
    return this._synced_at !== null;
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
      file_url = await ObservationSound.moveFromCacheToDocumentDirectory( sound.file_url, {
        basename: soundUUID
      } );
      // this needs a protocol for the sound player to play it when it's local
      file_url = `file://${file_url}`;
    }

    return {
      ...sound,
      file_url,
      uuid: soundUUID
    };
    /* eslint-enable camelcase */
  }

  static mapSoundForUpload( id, observationSound ) {
    const fileExt = Platform.OS === "android"
      ? "mp4"
      : "m4a";

    return {
      "sound[uuid]": observationSound.uuid,
      file: new FileUpload( {
        uri: observationSound.file_url,
        name: `${observationSound.uuid}.${fileExt}`,
        type: `audio/${fileExt}`
      } )
    };
  }

  static mapSoundForAttachingToObs( id, observationSound ) {
    return {
      "observation_sound[observation_id]": id,
      "observation_sound[sound_id]": observationSound.id
    };
  }

  static deleteSoundFromDeviceStorage( path ) {
    RNFS.exists( path ).then( fileExists => {
      if ( fileExists ) RNFS.unlink( path );
    } );
  }

  static async deleteRemoteSound( realm, uri, currentObservation ) {
    // TODO make this actually delete the sound
    const realmObs = realm.objectForPrimaryKey( "Observation", currentObservation.uuid );
    const obsSoundToDelete = realmObs?.observationSounds
      .find( os => os.file_url === uri );
    if ( obsSoundToDelete ) {
      console.log( "[DEBUG ObservationSound.js] deleting obsSoundToDelete: ", obsSoundToDelete );
      safeRealmWrite( realm, ( ) => {
        realm?.delete( obsSoundToDelete );
      }, "deleting remote observation sound in ObservationSound" );
    }
  }

  static async deleteLocalSound( realm, uri, currentObservation ) {
    // delete uri on disk
    ObservationSound.deleteSoundFromDeviceStorage( uri );
    const realmObs = realm.objectForPrimaryKey( "Observation", currentObservation.uuid );
    const obsSoundToDelete = realmObs?.observationSounds
      .find( p => p.file_url === uri );
    if ( obsSoundToDelete ) {
      safeRealmWrite( realm, ( ) => {
        realm?.delete( obsSoundToDelete );
      }, "deleting local observation sound in ObservationSound" );
    }
  }

  static async deleteSound( realm, uri, currentObservation ) {
    if ( uri.includes( "https://" ) ) {
      ObservationSound.deleteRemoteSound( realm, uri, currentObservation );
    } else {
      ObservationSound.deleteLocalSound( realm, uri, currentObservation );
    }
  }

  static schema = {
    name: "ObservationSound",
    embedded: true,
    properties: {
      // datetime the obsSound was created on the device
      _created_at: "date?",
      // datetime the obsSound was last synced with the server
      _synced_at: "date?",
      // datetime the obsSound was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      uuid: "string",
      id: "int?",
      file_url: { type: "string", mapTo: "fileUrl" },
      // this creates an inverse relationship so observation sounds
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "observationSounds"
      }
    }
  };
}

export default ObservationSound;
