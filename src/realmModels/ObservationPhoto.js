import { Realm } from "@realm/react";
import { FileUpload } from "inaturalistjs";
import uuid from "react-native-uuid";

import Photo from "./Photo";

class ObservationPhoto extends Realm.Object {
  static OBSERVATION_PHOTOS_FIELDS = {
    id: true,
    photo: Photo.PHOTO_FIELDS,
    position: true,
    uuid: true
  };

  static mapApiToRealm( observationPhoto, realm ) {
    const existingObsPhoto = realm
      ?.objectForPrimaryKey( "ObservationPhoto", observationPhoto.uuid );

    const localObsPhoto = {
      ...observationPhoto,
      _synced_at: new Date( ),
      photo: Photo.mapApiToRealm( observationPhoto.photo, existingObsPhoto )
    };
    if ( !existingObsPhoto ) {
      localObsPhoto._created_at = new Date( );
    }
    return localObsPhoto;
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

  static async new( uri, realm ) {
    const photo = realm.objects( "Photo" ).filtered( `localFilePath == "${uri}"` )[0];
    return {
      _created_at: new Date( ),
      _updated_at: new Date( ),
      uuid: uuid.v4( ),
      photo: photo || await Photo.new( uri )
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
