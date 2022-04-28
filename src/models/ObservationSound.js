import { Platform } from "react-native";
import { FileUpload } from "inaturalistjs";
class ObservationSound {
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
