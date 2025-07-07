import { Realm } from "@realm/react";
import { getJWT } from "components/LoginSignUp/AuthenticationService.ts";
import inatjs, { FileUpload } from "inaturalistjs";
import * as uuid from "uuid";

import Photo from "./Photo";

class ObservationPhoto extends Realm.Object {
  _created_at?: Date;

  _synced_at?: Date;

  _updated_at?: Date;

  uuid!: string;

  id?: number;

  photo?: Photo;

  position?: number;

  // TODO: I don't know how to type the assignee property

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

  static mapApiToRealm( observationPhoto, realm = null ) {
    const localObsPhoto = {
      ...observationPhoto,
      _synced_at: new Date( ),
      photo: Photo.mapApiToRealm( observationPhoto.photo, realm )
    };
    return localObsPhoto;
  }

  static mapPhotoForUpload( observationID, photo ) {
    const uri = Photo.getLocalPhotoUri( photo.localFilePath );
    return {
      file: new FileUpload( {
        uri,
        name: uri?.split( "/" ).pop( ),
        type: "image/jpeg"
      } )
    };
  }

  static mapPhotoForAttachingToObs( observationID, observationPhoto ) {
    return {
      observation_photo: {
        uuid: observationPhoto.uuid,
        observation_id: observationID,
        photo_id: observationPhoto.photo.id,
        position: observationPhoto.position
      }
    };
  }

  static mapPhotoForUpdating( observationID, observationPhoto ) {
    return {
      id: observationPhoto.uuid,
      observation_photo: {
        observation_id: observationID,
        position: observationPhoto.position
      }
    };
  }

  static mapObservationPhotoForMyObsDefaultMode( obsPhoto ) {
    return {
      photo: {
        url: obsPhoto?.photo?.url,
        localFilePath: obsPhoto?.photo?.localFilePath
      },
      uuid: obsPhoto?.uuid
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

  static async deleteRemotePhoto( realm, uri, currentObservation ) {
    const obsPhotoToDelete = currentObservation?.observationPhotos?.find(
      p => p.photo?.url === uri
    );

    if ( obsPhotoToDelete ) {
      const apiToken = await getJWT( );
      const options = { api_token: apiToken };
      await inatjs.observation_photos.delete( { id: obsPhotoToDelete.uuid }, options );
    }
  }

  static async deleteLocalPhoto( realm, uri ) {
    // delete uri on disk
    Photo.deletePhotoFromDeviceStorage( uri );
  }

  static async deletePhoto( realm, uri, currentObservation ) {
    if ( uri.includes( "https://" ) ) {
      ObservationPhoto.deleteRemotePhoto( realm, uri, currentObservation );
    } else {
      ObservationPhoto.deleteLocalPhoto( realm, uri );
    }
  }

  static mapObsPhotoUris( observation ) {
    const obsPhotos = observation?.observationPhotos || observation?.observation_photos;
    const obsPhotoUris = ( obsPhotos || [] ).map(
      // Ensure that if this URI is a remote thumbnail that we are resizing
      // a reasonably-sized image for Suggestions and not delivering a handful of
      // upsampled pixels
      obsPhoto => Photo.displayLocalOrRemoteMediumPhoto( obsPhoto.photo )
    );
    return obsPhotoUris;
  }

  static mapInnerPhotos( observation ) {
    const obsPhotos = observation?.observationPhotos || observation?.observation_photos;
    const innerPhotos = ( obsPhotos || [] ).map(
      obsPhoto => obsPhoto.photo
    );
    return innerPhotos;
  }

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
