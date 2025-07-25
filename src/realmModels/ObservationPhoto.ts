import { Realm } from "@realm/react";
import type { ApiObservationPhoto } from "api/types";
import inatjs, { FileUpload } from "inaturalistjs";
import type { RealmObservationPhoto, RealmPhoto } from "realmModels/types";
import * as uuid from "uuid";

import Photo from "./Photo";

class ObservationPhoto extends Realm.Object {
  _created_at?: Date;

  _synced_at?: Date;

  _updated_at?: Date;

  static OBSERVATION_PHOTOS_FIELDS = {
    id: true,
    photo: Photo.PHOTO_FIELDS,
    position: true,
    uuid: true
  } as const;

  needsSync( ) {
    return !this._synced_at || this._synced_at <= this._updated_at;
  }

  wasSynced( ) {
    return this._synced_at !== null;
  }

  static mapApiToRealm( observationPhoto: ApiObservationPhoto, realm = null ) {
    const localObsPhoto = {
      ...observationPhoto,
      _synced_at: new Date( ),
      photo: Photo.mapApiToRealm( observationPhoto.photo, realm )
    };
    return localObsPhoto;
  }

  static mapPhotoForUpload( photo: RealmPhoto ) {
    const uri = Photo.getLocalPhotoUri( photo.localFilePath );
    return {
      file: new FileUpload( {
        uri,
        name: uri?.split( "/" ).pop( ),
        type: "image/jpeg"
      } )
    };
  }

  static mapPhotoForAttachingToObs(
    observationID: number,
    observationPhoto: RealmObservationPhoto
  ) {
    return {
      observation_photo: {
        uuid: observationPhoto.uuid,
        observation_id: observationID,
        photo_id: observationPhoto.photo.id,
        position: observationPhoto.position
      }
    };
  }

  static mapPhotoForUpdating(
    observationID: number,
    observationPhoto: RealmObservationPhoto
  ) {
    return {
      id: observationPhoto.uuid,
      observation_photo: {
        observation_id: observationID,
        position: observationPhoto.position
      }
    };
  }

  // TODO: I don't know how what the type for this is outside of this context,
  // I think it is only called after certain transformations on the Realm result,
  // but it is not important for my current linear ticket so I'll skip typing it more
  static mapObservationPhotoForMyObsDefaultMode( observationPhoto: {
    photo?: { url?: string, localFilePath?: string },
    uuid?: string
  } ) {
    return {
      photo: {
        url: observationPhoto?.photo?.url,
        localFilePath: observationPhoto?.photo?.localFilePath
      },
      uuid: observationPhoto?.uuid
    };
  }

  static async new( uri: string, position: number ) {
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

  static createObsPhotosWithPosition = async (
    photos: string[] | { image: { uri: string } }[],
    { position, local }: { position: number, local: boolean }
  ) => {
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

  // TODO: I don't know how what the type for currentObservation is outside of this context here,
  // in the zustand store slice that is referenced in the two places this function is called
  // there are no types yet as far as I can see. This function is not important for my current
  // linear ticket so I'll skip typing it
  static async deleteRemotePhoto(
    uri: string,
    currentObservation?: { observationPhotos?: { photo: { url?: string }, uuid: string }[] }
  ) {
    const obsPhotoToDelete = currentObservation?.observationPhotos?.find(
      p => p.photo?.url === uri
    );

    if ( obsPhotoToDelete ) {
      // Removing this require breaks tests, so I am leaving it here
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getJWT } = require( "components/LoginSignUp/AuthenticationService.ts" );
      const apiToken = await getJWT( );
      const options = { api_token: apiToken };
      await inatjs.observation_photos.delete( { id: obsPhotoToDelete.uuid }, options );
    }
  }

  static async deleteLocalPhoto( uri: string ) {
    // delete uri on disk
    Photo.deletePhotoFromDeviceStorage( uri );
  }

  // TODO: I don't know how what the type for currentObservation is outside of this context here,
  // in the zustand store slice that is referenced in the two places this function is called
  // there are no types yet as far as I can see. This function is not important for my current
  // linear ticket so I'll skip typing it
  static async deletePhoto(
    uri: string,
    currentObservation?: { observationPhotos?: { photo: { url?: string }, uuid: string }[] }
  ) {
    if ( uri.includes( "https://" ) ) {
      ObservationPhoto.deleteRemotePhoto( uri, currentObservation );
    } else {
      ObservationPhoto.deleteLocalPhoto( uri );
    }
  }

  // TODO: I don't know how what the type for currentObservation is outside of this context here,
  // in the zustand store slice that is referenced in the two places this function is called
  // there are no types yet as far as I can see. This function is not important for my current
  // linear ticket so I'll skip typing it
  static mapObsPhotoUris(
    observation: {
      observationPhotos?: { photo: RealmPhoto }[],
      observation_photos?: { photo: RealmPhoto }[]
    }
  ) {
    const obsPhotos = observation?.observationPhotos || observation?.observation_photos;
    const obsPhotoUris = ( obsPhotos || [] ).map(
      // Ensure that if this URI is a remote thumbnail that we are resizing
      // a reasonably-sized image for Suggestions and not delivering a handful of
      // upsampled pixels
      obsPhoto => Photo.displayLocalOrRemoteMediumPhoto( obsPhoto.photo )
    );
    return obsPhotoUris;
  }

  // TODO: I don't know how what the type for currentObservation is outside of this context here,
  // in the zustand store slice that is referenced in the two places this function is called
  // there are no types yet as far as I can see. This function is not important for my current
  // linear ticket so I'll skip typing it
  static mapInnerPhotos(
    observation: {
      observationPhotos?: { photo: object }[],
      observation_photos?: { photo: object }[]
    }
  ) {
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
