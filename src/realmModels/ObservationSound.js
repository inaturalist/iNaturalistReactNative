import { Realm } from "@realm/react";
import { FileUpload } from "inaturalistjs";
import { Platform } from "react-native";
import RNFS from "react-native-fs";
import uuid from "react-native-uuid";

class ObservationSound extends Realm.Object {
  static OBSERVATION_SOUNDS_FIELDS = {
    id: true,
    file_url: true,
    flags: {
      id: true,
      created_at: true,
      resolved_at: true,
      updated_at: true,
      uuid: true
    },
    uuid: true
  };

  wasSynced( ) {
    return this._synced_at !== null;
  }

  static async moveFromCacheToDocumentDirectory( soundUUID ) {
    const fileExt = Platform.OS === "android"
      ? "mp4"
      : "m4a";
    const soundPath = `${soundUUID}.${fileExt}`;
    // in theory, should be able to pass in a path to the audio recorder
    // but that's buggy so moving the file from cache to document directory instead

    const audioFile = `${RNFS.CachesDirectoryPath}/sound.${fileExt}`;
    const soundUploadsFolder = `${RNFS.DocumentDirectoryPath}/soundUploads`;
    await RNFS.mkdir( soundUploadsFolder );
    const soundDirectory = `${soundUploadsFolder}/${soundPath}`;

    await RNFS.moveFile( audioFile, soundDirectory );
    return soundDirectory;
  }

  static async new( ) {
    const soundUUID = uuid.v4( );
    const uri = await ObservationSound.moveFromCacheToDocumentDirectory( soundUUID );

    return {
      file_url: uri,
      uuid: soundUUID
    };
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
