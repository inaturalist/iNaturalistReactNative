import Photo from "./Photo";
import { FileUpload } from "inaturalistjs";

class ObservationPhoto {
  static mapApiToRealm( observationPhoto ) {
    return {
      ...observationPhoto,
      photo: Photo.mapApiToRealm( observationPhoto.photo )
    };
  }

  static saveLocalObservationPhotoForUpload( observationPhoto ) {
    return {
      ...observationPhoto,
      photo: Photo.saveLocalPhotoForUpload( observationPhoto )
    };
  }

  static mapPhotoForUpload( id, observationPhoto ) {
    return {
      "observation_photo[observation_id]": id,
      "observation_photo[uuid]": observationPhoto.uuid,
      file: new FileUpload( {
        uri: observationPhoto.photo.localFilePath,
        name: `${observationPhoto.uuid}.jpeg`,
        type: "image/jpeg"
      } )
    };
  }

  static schema = {
    name: "ObservationPhoto",
    primaryKey: "uuid",
    properties: {
      // datetime the obsPhoto was created on the device
      _created_at: "date?",
      // datetime the obsPhoto was last synced with the server
      _synced_at: "date?",
      // datetime the obsPhoto was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      uuid: "string",
      id: "int?",
      photo: "Photo?",
      position: "int?",
      // this creates an inverse relationship so observation photos
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "observationPhotos"
      }
    }
  }
}

export default ObservationPhoto;
