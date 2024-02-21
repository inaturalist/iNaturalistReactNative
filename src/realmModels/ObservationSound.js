import { Realm } from "@realm/react";
import { FileUpload } from "inaturalistjs";
import { Platform } from "react-native";
import RNFS from "react-native-fs";
import uuid from "react-native-uuid";

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
    const soundUploadsFolder = `${RNFS.DocumentDirectoryPath}/soundUploads`;
    await RNFS.mkdir( soundUploadsFolder );
    const dstPath = `${soundUploadsFolder}/${fileName}`;

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
