import { Realm } from "@realm/react";
import inatjs from "inaturalistjs";
import uuid from "react-native-uuid";
import { createObservedOnStringForUpload, formatDateAndTime } from "sharedHelpers/dateAndTime";

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
    captive: true,
    comments: Comment.COMMENT_FIELDS,
    created_at: true,
    description: true,
    geojson: true,
    geoprivacy: true,
    id: true,
    identifications: Identification.ID_FIELDS,
    latitude: true,
    location: true,
    longitude: true,
    observation_photos: ObservationPhoto.OBSERVATION_PHOTOS_FIELDS,
    place_guess: true,
    quality_grade: true,
    taxon: Taxon.TAXON_FIELDS,
    time_observed_at: true,
    user: User && User.USER_FIELDS
  }

  static async new( obs ) {
    return {
      ...obs,
      captive_flag: false,
      geoprivacy: "open",
      owners_identification_from_vision: false,
      observed_on_string: createObservedOnStringForUpload( ),
      quality_grade: "needs_id",
      // project_ids: [],
      uuid: uuid.v4( )
    };
  }

  static async createObsWithPhotos( observationPhotos ) {
    const observation = await Observation.new( );
    observation.observationPhotos = observationPhotos;
    return observation;
  }

  static async createObsWithSounds( ) {
    const observation = await Observation.new( );
    const sound = await ObservationSound.new( );
    observation.observationSounds = [sound];
    return observation;
  }

  static async formatObsPhotos( photos, realm ) {
    return Promise.all( photos.map( async photo => {
      // photo.image?.uri is for gallery photos; photo is for normal camera
      const uri = photo.image?.uri || photo;
      return ObservationPhoto.new( uri, realm );
    } ) );
  }

  static async createMutipleObsFromGalleryPhotos( obs, realm ) {
    return Promise.all( obs.map( async ( { photos } ) => {
      // take the observed_on_string time from the first photo in an observation
      const observedOn = formatDateAndTime( photos[0].timestamp );
      const obsPhotos = await Observation.formatObsPhotos( photos, realm );
      return Observation.createObsWithPhotos( obsPhotos, observedOn );
    } ) );
  }

  static mimicRealmMappedPropertiesSchema( obs ) {
    const createLinkedObjects = ( list, createFunction ) => {
      if ( list.length === 0 ) { return list; }
      return list.map( item => {
        if ( createFunction === Identification ) {
          // this one requires special treatment for appending taxon objects
          return createFunction.mimicRealmMappedPropertiesSchema( item );
        }
        return createFunction.mapApiToRealm( item );
      } );
    };

    const taxon = obs.taxon ? Taxon.mimicRealmMappedPropertiesSchema( obs.taxon ) : null;
    const observationPhotos = createLinkedObjects( obs.observation_photos, ObservationPhoto );
    const comments = createLinkedObjects( obs.comments, Comment );
    const identifications = createLinkedObjects( obs.identifications, Identification );
    const user = User.mapApiToRealm( obs.user );

    return {
      ...obs,
      comments: comments || [],
      createdAt: obs.created_at,
      identifications: identifications || [],
      latitude: obs.geojson ? obs.geojson.coordinates[1] : null,
      longitude: obs.geojson ? obs.geojson.coordinates[0] : null,
      observationPhotos,
      placeGuess: obs.place_guess,
      qualityGrade: obs.quality_grade,
      taxon,
      timeObservedAt: obs.time_observed_at,
      user
    };
  }

  static createLinkedObjects = ( list, createFunction, realm ) => {
    if ( list.length === 0 ) { return list; }
    return list.map( item => createFunction.mapApiToRealm( item, realm ) );
  };

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

    const localObs = {
      ...obs,
      _synced_at: new Date( ),
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
    const currentUser = realm.objects( "User" ).filtered( "signedIn == true" )[0];
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
      ...obs.toJSON( ),
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
    const photo = obs.observation_photos[0];
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

  static fetchObservationUpdates = async ( realm, apiToken ) => {
    if ( !apiToken ) { return null; }

    const params = {
      observations_by: "owner",
      per_page: 200,
      fields: "viewed,resource_uuid"
    };

    const options = { api_token: apiToken };
    try {
      const { results } = await inatjs.observations.updates( params, options );
      const unviewed = results.filter( result => result.viewed === false ).map( r => r );
      unviewed.forEach( update => {
        const existingObs = realm?.objectForPrimaryKey( "Observation", update.resource_uuid );
        if ( !existingObs ) { return; }
        realm?.write( ( ) => {
          existingObs.viewed = update.viewed;
        } );
      } );
      return unviewed;
    } catch ( e ) {
      console.log( "Couldn't fetch observation updates:", JSON.stringify( e ) );
      return null;
    }
  }

  static markObservationUpdatesViewed = async ( id, apiToken ) => {
    if ( !apiToken ) { return null; }

    const params = { id };
    const options = { api_token: apiToken };
    try {
      return await inatjs.observations.viewedUpdates( params, options );
    } catch ( e ) {
      console.log( `Couldn't mark observation ${id} viewed:`, JSON.stringify( e ) );
      return null;
    }
  }

  static fetchRemoteObservations = async ( page, realm ) => {
    const currentUser = realm.objects( "User" ).filtered( "signedIn == true" )[0];
    if ( !currentUser ) { return null; }

    const params = {
      user_id: currentUser.id,
      page,
      per_page: 6,
      fields: Observation.FIELDS
    };

    try {
      const { results } = await inatjs.observations.search( params );
      return results;
    } catch ( e ) {
      console.log( "Couldn't fetch observations:", JSON.stringify( e.response ) );
      return null;
    }
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

  static updateLocalObservationsFromRemote = ( realm, results ) => {
    if ( results.length === 0 ) { return; }
    const obsToUpsert = results.filter( obs => !Observation.isUnsyncedObservation( realm, obs ) );
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

  static markRecordUploaded = async ( recordUUID, type, response, realm ) => {
    const { id } = response.results[0];
    try {
      const record = realm.objectForPrimaryKey( type, recordUUID );
      realm?.write( ( ) => {
        record.id = id;
        record._synced_at = new Date( );
      } );
    } catch ( e ) {
      console.log( e, `couldn't mark ${type} uploaded in realm` );
    }
  };

  static uploadToServer = async (
    evidenceUUID: string,
    type: string,
    params: Object,
    apiEndpoint: Function,
    realm: any,
    apiToken: string
  ) => {
    const options = { api_token: apiToken };

    let response;
    try {
      response = await apiEndpoint.create( params, options );
      await Observation.markRecordUploaded( evidenceUUID, type, response, realm );
    } catch ( e ) {
      return JSON.stringify( e.response );
    }
    return response;
  };

  static uploadEvidence = async (
    evidence: Array<Object>,
    type: string,
    apiSchemaMapper: Function,
    observationId: number,
    apiEndpoint: Function,
    realm: any,
    apiToken: string
  ): Promise<any> => {
    let response;
    if ( evidence.length === 0 ) { return; }
    for ( let i = 0; i < evidence.length; i += 1 ) {
      const currentEvidence = evidence[i];
      const evidenceUUID = currentEvidence.uuid;
      const params = apiSchemaMapper( observationId, currentEvidence );
      response = Observation.uploadToServer(
        evidenceUUID,
        type,
        params,
        apiEndpoint,
        realm,
        apiToken
      );
    }
    // eslint-disable-next-line consistent-return
    return response;
  };

  static uploadObservation = async ( obs, apiToken ) => {
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
    try {
      response = await inatjs.observations.create( uploadParams, options );
    } catch ( uploadError ) {
      const errorText = await uploadError.response.text( );
      uploadError.message = errorText;
      throw uploadError;
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
      captive_flag: "bool?",
      comments: "Comment[]",
      // timestamp of when observation was created on the server; not editable
      created_at: { type: "string?", mapTo: "createdAt" },
      description: "string?",
      geoprivacy: "string?",
      id: "int?",
      identifications: "Identification[]",
      latitude: "double?",
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
      viewed: "bool?"
    }
  }
}

export default Observation;
