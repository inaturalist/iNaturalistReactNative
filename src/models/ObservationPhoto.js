import { FileUpload } from "inaturalistjs";
import uuid from "react-native-uuid";
import Realm from "realm";

import Photo from "./Photo";
import resizeImageForUpload from "../providers/uploadHelpers/resizeImage";

class ObservationPhoto extends Realm.Object {
  static OBSERVATION_PHOTOS_FIELDS = {
    id: true,
    photo: Photo.PHOTO_FIELDS,
    position: true,
    uuid: true
  };

  static mapApiToRealm( observationPhoto ) {
    return {
      ...observationPhoto,
      photo: Photo.mapApiToRealm( observationPhoto.photo )
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

  static async new( uri ) {
    const localFilePath = await resizeImageForUpload( uri );

    return {
      uuid: uuid.v4( ),
      photo: {
        localFilePath
      }
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
