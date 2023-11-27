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

  needsSync( ) {
    return !this._synced_at || this._synced_at <= this._updated_at;
  }

  wasSynced( ) {
    return this._synced_at !== null;
  }

  static mapApiToRealm( observationPhoto, existingObs ) {
    const obsPhotos = existingObs?.observationPhotos;
    const existingObsPhoto = obsPhotos?.find( p => p.uuid === observationPhoto.uuid );

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

  static mapPhotoForUpload( observtionID, observationPhoto ) {
    return {
      "photo[uuid]": observationPhoto.uuid,
      file: new FileUpload( {
        uri: observationPhoto.photo.localFilePath,
        name: `${observationPhoto.uuid}.jpeg`,
        type: "image/jpeg"
      } )
    };
  }

  static mapPhotoForAttachingToObs( id, observationPhoto ) {
    return {
      "observation_photo[observation_id]": id,
      "observation_photo[photo_id]": observationPhoto.id
    };
  }

  static async new( uri, position ) {
    const photo = await Photo.new( uri );
    return {
      _created_at: new Date( ),
      _updated_at: new Date( ),
      uuid: uuid.v4( ),
      photo,
      originalPhotoUri: uri,
      position
    };
  }

  static createObsPhotosWithPosition = async ( photos, { position, local } ) => {
    let photoPosition = position;
    return Promise.all(
      photos.map( async photo => {
        const newPhoto = ObservationPhoto.new(
          local
            ? photo
            : photo?.image?.uri,
          photoPosition
        );
        photoPosition += 1;
        return newPhoto;
      } )
    );
  };

  static deleteObservationPhoto = ( list, photo ) => {
    const i = list.findIndex(
      p => p.photo.localFilePath === photo || p.originalPhotoUri === photo
    );
    list.splice( i, 1 );
    return list;
  };

  static schema = {
    name: "ObservationPhoto",
    embedded: true,
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
  };
}

export default ObservationPhoto;
