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
        name: "photo.jpeg",
        type: "image/jpeg"
      } )
    };
  }

  static schema = {
    name: "ObservationPhoto",
    primaryKey: "uuid",
    properties: {
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
