import { Realm } from "@realm/react";
// eslint-disable-next-line import/no-cycle
import { createObservation, createOrUpdateEvidence, updateObservation } from "api/observations";
import inatjs from "inaturalistjs";
import uuid from "react-native-uuid";
import { createObservedOnStringForUpload } from "sharedHelpers/dateAndTime";
import { EventRegister } from 'react-native-event-listeners'

import Application from "./Application";
import Comment from "./Comment";
import Identification from "./Identification";
import ObservationPhoto from "./ObservationPhoto";
import ObservationSound from "./ObservationSound";
import Taxon from "./Taxon";
import User from "./User";

// noting that methods like .toJSON( ) are only accessible when the model
// class is extended with Realm.Object per this issue:
// https://github.com/realm/realm-js/issues/3600#issuecomment-785828614
class Observation extends Realm.Object {
  static FIELDS = {
    application: Application.APPLICATION_FIELDS,
    captive: true,
    comments: Comment.COMMENT_FIELDS,
    created_at: true,
    description: true,
    geojson: true,
    geoprivacy: true,
    id: true,
    identifications: Identification.ID_FIELDS,
    latitude: true,
    license_code: true,
    location: true,
    longitude: true,
    observation_photos: ObservationPhoto.OBSERVATION_PHOTOS_FIELDS,
    place_guess: true,
    quality_grade: true,
    taxon: Taxon.TAXON_FIELDS,
    time_observed_at: true,
    user: User && User.USER_FIELDS,
    updated_at: true
  }

  static async new( obs ) {
    return {
      ...obs,
      captive_flag: false,
      geoprivacy: "open",
      owners_identification_from_vision: false,
      observed_on_string: obs?.observed_on_string || createObservedOnStringForUpload( ),
      quality_grade: "needs_id",
      uuid: uuid.v4( )
    };
  }

  static async createObsWithSounds( ) {
    const observation = await Observation.new( );
    const sound = await ObservationSound.new( );
    observation.observationSounds = [sound];
    return observation;
  }

  static createLinkedObjects = ( list, createFunction, realm ) => {
    if ( list.length === 0 ) { return list; }
    return list.map( item => createFunction.mapApiToRealm( item, realm ) );
  };

  static upsertRemoteObservations( observations, realm ) {
    if ( observations && observations.length > 0 ) {
      const obsToUpsert = observations.filter(
        obs => !Observation.isUnsyncedObservation( realm, obs )
      );
      realm.write( ( ) => {
        obsToUpsert.forEach( obs => {
          realm.create(
            "Observation",
            Observation.createOrModifyLocalObservation( obs, realm ),
            "modified"
          );
        } );
      } );
    }
  }

  static createOrModifyLocalObservation( obs, realm ) {
    const existingObs = realm?.objectForPrimaryKey( "Observation", obs.uuid );
    const taxon = obs.taxon ? Taxon.mapApiToRealm( obs.taxon ) : null;
    const observationPhotos = Observation.createLinkedObjects(
      obs.observation_photos,
      ObservationPhoto,
      realm
    );
    const comments = Observation.createLinkedObjects( obs.comments, Comment, realm );
    const identifications = Observation.createLinkedObjects(
      obs.identifications,
      Identification,
      realm
    );
    const user = User.mapApiToRealm( obs.user );
    const application = Application.mapApiToRealm( obs.application );

    const localObs = {
      ...obs,
      _synced_at: new Date( ),
      application,
      comments,
      identifications,
      // obs detail on web says geojson coords are preferred over lat/long
      // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/ducks/observation.js#L145
      latitude: obs.geojson && obs.geojson.coordinates && obs.geojson.coordinates[1],
      longitude: obs.geojson && obs.geojson.coordinates && obs.geojson.coordinates[0],
      observationPhotos,
      taxon,
      user
    };

    if ( !existingObs ) {
      localObs._created_at = new Date( localObs.created_at );
      if ( isNaN( localObs._created_at ) ) {
        localObs._created_at = new Date( );
      }
    }
    return localObs;
  }

  static async saveLocalObservationForUpload( obs, realm ) {
    // make sure local observations have user details for ObsDetail
    const currentUser = User.currentUser( realm );
    if ( currentUser ) {
      obs.user = currentUser;
    }

    const timestamps = {
      _updated_at: new Date( )
    };

    const existingObservation = realm.objectForPrimaryKey( "Observation", obs.uuid );

    if ( !existingObservation ) {
      timestamps._created_at = new Date( );
      timestamps._synced_at = null;
    }

    const addTimestampsToEvidence = evidence => {
      // right now there isn't a way to edit photos or sounds via ObsEdit
      // so we only need to add timestamps on the first time a local observation is saved
      if ( !existingObservation && evidence ) {
        return evidence.map( record => ( {
          ...timestamps,
          ...record
        } ) );
      }
      return evidence;
    };

    const taxon = obs.taxon ? Taxon.mapApiToRealm( obs.taxon ) : null;
    const observationPhotos = addTimestampsToEvidence( obs.observationPhotos );
    const observationSounds = addTimestampsToEvidence( obs.observationSounds );

    const obsToSave = {
      // just ...obs causes problems when obs is a realm object
      // ...obs.toJSON( ),
      ...obs,
      ...timestamps,
      taxon,
      observationPhotos,
      observationSounds
    };

    realm?.write( ( ) => {
      // using 'modified' here for the case where a new observation has the same Taxon
      // as a previous observation; otherwise, realm will error out
      // also using modified for updating observations which were already saved locally
      realm?.create( "Observation", obsToSave, "modified" );
    } );
    return realm.objectForPrimaryKey( "Observation", obs.uuid );
  }

  static mapObservationForUpload( obs ) {
    return {
      species_guess: obs.species_guess,
      description: obs.description,
      observed_on_string: obs.observed_on_string,
      place_guess: obs.place_guess,
      latitude: obs.latitude,
      longitude: obs.longitude,
      positional_accuracy: obs.positional_accuracy,
      taxon_id: obs.taxon && obs.taxon.id,
      geoprivacy: obs.geoprivacy,
      uuid: obs.uuid,
      captive_flag: obs.captive_flag,
      owners_identification_from_vision: obs.owners_identification_from_vision
    };
  }

  static projectUri = obs => {
    const photo = obs?.observation_photos?.[0];
    if ( !photo ) { return null; }
    if ( !photo.photo ) { return null; }
    if ( !photo.photo.url ) { return null; }

    return { uri: obs.observation_photos[0].photo.url };
  }

  static mediumUri = obs => {
    const photo = obs.observation_photos[0];
    if ( !photo ) { return null; }
    if ( !photo.photo ) { return null; }
    if ( !photo.photo.url ) { return null; }

    const mediumUri = obs.observation_photos[0].photo.url.replace( "square", "medium" );

    return { uri: mediumUri };
  }

  static filterUnsyncedObservations = realm => {
    const unsyncedFilter = "_synced_at == null || _synced_at <= _updated_at";
    const photosUnsyncedFilter = "ANY observationPhotos._synced_at == null";

    const obs = realm?.objects( "Observation" );
    const unsyncedObs = obs.filtered( `${unsyncedFilter} || ${photosUnsyncedFilter}` );
    return unsyncedObs;
  }

  static isUnsyncedObservation = ( realm, obs ) => {
    const obsList = Observation.filterUnsyncedObservations( realm );
    const unsyncedObs = obsList.filtered( `uuid == "${obs.uuid}"` );
    return unsyncedObs.length > 0;
  }

  static markRecordUploaded = async ( recordUUID, type, response, realm ) => {
    const { id } = response.results[0];

    const record = realm.objectForPrimaryKey( type, recordUUID );
    realm?.write( ( ) => {
      record.id = id;
      record._synced_at = new Date( );
    } );
  };

  static uploadToServer = async (
    evidenceUUID: string,
    type: string,
    params: Object,
    apiEndpoint: Function,
    realm: any,
    options: Object
  ) => {
    const response = await createOrUpdateEvidence( apiEndpoint, params, options );
    if ( response ) {
      await Observation.markRecordUploaded( evidenceUUID, type, response, realm );
    }
  };

  static uploadEvidence = async (
    evidence: Array<Object>,
    type: string,
    apiSchemaMapper: Function,
    observationId: number,
    apiEndpoint: Function,
    realm: any,
    options: Object,
    forceUpload: boolean
  ): Promise<any> => {
    // only try to upload evidence which is not yet on the server
    const unsyncedEvidence = forceUpload ? evidence : evidence.filter( item => !item.wasSynced( ) );

    const responses = await Promise.all( unsyncedEvidence.map( item => {
      const currentEvidence = item.toJSON( );
      const evidenceUUID = currentEvidence.uuid;

      // Remove all null values, b/c the API doesn't seem to like them
      const newPhoto = {};
      const photo = currentEvidence?.photo;
      Object.keys( photo ).forEach( k => {
        if ( photo[k] !== null ) {
          newPhoto[k] = photo[k];
        }
      } );

      currentEvidence.photo = newPhoto;

      const params = apiSchemaMapper( observationId, currentEvidence );
      return Observation.uploadToServer(
        evidenceUUID,
        type,
        params,
        apiEndpoint,
        realm,
        options
      );
    } ) );
    // eslint-disable-next-line consistent-return
    return responses[0];
  };

  static uploadObservation = async ( obs, apiToken, realm ) => {
    EventRegister.emit(
      "INCREMENT_OBSERVATION_PROGRESS",
      [obs.uuid, .05]
    );
    const obsToUpload = Observation.mapObservationForUpload( obs );
    const options = { api_token: apiToken };

    // Remove all null values, b/c the API doesn't seem to like them for some
    // reason (might be an error with the API as of 20220801)
    const newObs = {};
    Object.keys( obsToUpload ).forEach( k => {
      if ( obsToUpload[k] !== null ) {
        newObs[k] = obsToUpload[k];
      }
    } );

    const uploadParams = {
      observation: { ...newObs },
      fields: { id: true }
    };

    let response;

    // First upload the photos/sounds (before uploading the observation itself)
    const hasPhotos =  obs?.observationPhotos?.length > 0
    const hasSounds = obs?.observationSounds?.length > 0

   await Promise.all([
     hasPhotos
       ? Observation.uploadEvidence(
           obs.observationPhotos,
           "ObservationPhoto",
           ObservationPhoto.mapPhotoForUpload,
           null,
           inatjs.photos.create,
           realm,
           options
         ).then(() => {
           EventRegister.emit("INCREMENT_OBSERVATION_PROGRESS", [
             obs.uuid,
             hasSounds ? 0.125 : 0.25,
           ]);
         })
       : null,
     hasSounds
       ? Observation.uploadEvidence(
           obs.observationSounds,
           "ObservationSound",
           ObservationSound.mapSoundForUpload,
           null,
           inatjs.sounds.create,
           realm,
           options
         ).then(() => {
           EventRegister.emit("INCREMENT_OBSERVATION_PROGRESS", [
             obs.uuid,
             hasPhotos ? 0.125 : 0.25,
           ]);
         })
       : null,
   ]);

   if (!hasPhotos && !hasSounds) {
      EventRegister.emit("INCREMENT_OBSERVATION_PROGRESS", [
        obs.uuid,
        .25,
      ]);
   }

    // TODO

    const wasPreviouslySynced = obs.wasSynced( );

    if ( wasPreviouslySynced ) {
      response = await updateObservation( {
        id: newObs.uuid,
        ignore_photos: true,
        observation: { ...newObs },
        fields: { id: true }
      }, options );
    } else {
      // TODO - before creating observation, POST /v2/photos or POST /v2/sounds
      response = await createObservation( uploadParams, options );
    }

    EventRegister.emit("INCREMENT_OBSERVATION_PROGRESS", [
      obs.uuid,
      .3,
    ]);

    const { uuid: obsUUID } = response.results[0];
    await Promise.all([
      Observation.markRecordUploaded(obs.uuid, "Observation", response, realm),
      // Next, attach the uploaded photos/sounds to the uploaded observation
      hasPhotos
        ? Observation.uploadEvidence(
            obs.observationPhotos,
            "ObservationPhoto",
            ObservationPhoto.mapPhotoForAttachingToObs,
            obsUUID,
            inatjs.observation_photos.create,
            realm,
            options,
            true
          ).then(() => {
            EventRegister.emit("INCREMENT_OBSERVATION_PROGRESS", [
              obs.uuid,
              hasSounds ? 0.2 : 0.4,
            ]);
          })
        : null,
      hasSounds
        ? Observation.uploadEvidence(
            obs.observationSounds,
            "ObservationSound",
            ObservationSound.mapSoundForAttachingToObs,
            obsUUID,
            inatjs.observation_sounds.create,
            realm,
            options,
            true
          ).then(() => {
            EventRegister.emit("INCREMENT_OBSERVATION_PROGRESS", [
              obs.uuid,
              hasPhotos ? 0.2 : 0.4,
            ]);
          })
        : null,
    ]);

    if (!hasPhotos && !hasSounds) {
      EventRegister.emit("INCREMENT_OBSERVATION_PROGRESS", [
        obs.uuid,
        .4,
      ]);
   }

    return response;
  }

  static schema = {
    name: "Observation",
    primaryKey: "uuid",
    properties: {
      // datetime the observation was created on the device
      _created_at: "date?",
      // datetime the observation was last synced with the server
      _synced_at: "date?",
      // datetime the observation was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      uuid: "string",
      application: "Application?",
      captive_flag: "bool?",
      comments: "Comment[]",
      // timestamp of when observation was created on the server; not editable
      created_at: { type: "string?", mapTo: "createdAt" },
      description: "string?",
      geoprivacy: "string?",
      id: "int?",
      identifications: "Identification[]",
      latitude: "double?",
      license_code: { type: "string?", mapTo: "licenseCode" },
      longitude: "double?",
      observationPhotos: "ObservationPhoto[]",
      observationSounds: "ObservationSound[]",
      // date and/or time submitted to the server when a new obs is uploaded
      observed_on_string: "string?",
      owners_identification_from_vision: "bool?",
      species_guess: "string?",
      place_guess: { type: "string?", mapTo: "placeGuess" },
      positional_accuracy: "double?",
      quality_grade: { type: "string?", mapTo: "qualityGrade" },
      taxon: "Taxon?",
      // datetime when the observer observed the organism; user-editable, but
      // only by changing observed_on_string
      time_observed_at: { type: "string?", mapTo: "timeObservedAt" },
      user: "User?",
      updated_at: "date?",
      viewed: "bool?"
    }
  }

  needsSync( ) {
    const obsPhotosNeedSync = this.observationPhotos
      .filter( obsPhoto => obsPhoto.needsSync( ) ).length > 0;
    return !this._synced_at || this._synced_at <= this._updated_at || obsPhotosNeedSync;
  }

  wasSynced( ) {
    return this._synced_at !== null;
  }
}

export default Observation;
