import { Platform } from "react-native";
import { FileUpload } from "inaturalistjs";
import RNFS from "react-native-fs";
import uuid from "react-native-uuid";

import { createObservedOnStringForUpload } from "../sharedHelpers/dateAndTime";
import fetchUserLocation from "../sharedHelpers/fetchUserLocation";
class ObservationSound {
  static async moveFromCacheToDocumentDirectory( soundUUID ) {
    const fileExt = Platform.OS === "android" ? "mp4" : "m4a";
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

  static async createNewSound( ) {
    const latLng = await fetchUserLocation( );
    const soundUUID = uuid.v4( );
    const uri = await ObservationSound.moveFromCacheToDocumentDirectory( soundUUID );

    return {
      ...latLng,
      observationSounds: [{
        uri,
        uuid: soundUUID
      }],
      observed_on_string: createObservedOnStringForUpload( )
    };
  }

  static saveLocalObservationSoundForUpload( sound ) {
    return {
      ...sound,
      file_url: sound.uri
    };
  }

  static mapSoundForUpload( id, observationSound ) {
    const fileExt = Platform.OS === "android" ? "mp4" : "m4a";

    return {
      "observation_sound[observation_id]": id,
      "observation_sound[uuid]": observationSound.uuid,
      file: new FileUpload( {
        uri: observationSound.file_url,
        name: `${observationSound.uuid}.${fileExt}`,
        type: `audio/${fileExt}`
      } )
    };
  }

  static schema = {
    name: "ObservationSound",
    primaryKey: "uuid",
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
  }
}

export default ObservationSound;
