import { Platform } from "react-native";
import { FileUpload } from "inaturalistjs";
class ObservationSound {
  static saveLocalObservationSoundForUpload( observationSound ) {
    console.log( observationSound, "sound" );
    return {
      ...observationSound,
      file_url: observationSound.uri
    };
  }

  static mapSoundForUpload( id, observationSound ) {
    console.log( observationSound.file_url );
    const fileExt = Platform.OS === "android" ? "mp4" : "m4a";

    return {
      "observation_sound[observation_id]": id,
      "observation_sound[uuid]": observationSound.uuid,
      file: new FileUpload( {
        uri: observationSound.file_url,
        name: `audio.${fileExt}`,
        type: `audio/${fileExt}`
      } )
    };
  }

  static schema = {
    name: "ObservationSound",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      id: "int?",
      file_url: { type: "string", mapTo: "fileUrl" },
      // this creates an inverse relationship so observation sounds
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "observationSound"
      }
    }
  }
}

export default ObservationSound;
