import { Realm } from "@realm/react";
import uuid from "react-native-uuid";
import { createObservedOnStringForUpload } from "sharedHelpers/dateAndTime";
import { formatExifDateAsString, parseExif } from "sharedHelpers/parseExif";

import Application from "./Application";
import Comment from "./Comment";
import Identification from "./Identification";
import ObservationPhoto from "./ObservationPhoto";
import ObservationSound from "./ObservationSound";
import Taxon from "./Taxon";
import User from "./User";
import Vote from "./Vote";

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
    faves: Vote.VOTE_FIELDS,
    geojson: true,
    geoprivacy: true,
    id: true,
    identifications: Identification.ID_FIELDS,
    latitude: true,
    license_code: true,
    location: true,
    longitude: true,
    obscured: true,
    observation_photos: ObservationPhoto.OBSERVATION_PHOTOS_FIELDS,
    observed_on: true,
    place_guess: true,
    quality_grade: true,
    sounds: ObservationSound.OBSERVATION_SOUNDS_FIELDS,
    taxon: Taxon.TAXON_FIELDS,
    time_observed_at: true,
    user: User && User.USER_FIELDS,
    updated_at: true,
    viewer_trusted_by_observer: true,
    private_geojson: true,
    private_location: true,
    private_place_guess: true,
    positional_accuracy: true
  };

  static LIST_FIELDS = {
    comments: Comment.COMMENT_FIELDS,
    created_at: true,
    geojson: true,
    id: true,
    identifications: Identification.ID_FIELDS,
    geoprivacy: true,
    latitude: true,
    longitude: true,
    observation_photos: ObservationPhoto.OBSERVATION_PHOTOS_FIELDS,
    place_guess: true,
    private_place_guess: true,
    private_geojson: true,
    quality_grade: true,
    taxon: Taxon.TAXON_FIELDS,
    time_observed_at: true,
    user: User && User.USER_FIELDS
  };

  static async new( obs ) {
    return {
      ...obs,
      captive_flag: false,
      geoprivacy: "open",
      owners_identification_from_vision: false,
      observed_on: obs?.observed_on,
      observed_on_string: obs
        ? obs?.observed_on_string
        : createObservedOnStringForUpload( ),
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
    const taxon = obs.taxon
      ? Taxon.mapApiToRealm( obs.taxon )
      : null;
    const observationPhotos = (
      obs.observation_photos || obs.observationPhotos || []
    ).map( obsPhoto => ObservationPhoto.mapApiToRealm( obsPhoto, existingObs ) );

    const identifications = obs.identifications
      ? obs.identifications.map( id => Identification.mapApiToRealm( id ) )
      : [];

    const localObs = {
      ...obs,
      _synced_at: new Date( ),
      identifications,
      // obs detail on web says geojson coords are preferred over lat/long
      // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/ducks/observation.js#L145
      latitude: obs.geojson && obs.geojson.coordinates && obs.geojson.coordinates[1],
      longitude: obs.geojson && obs.geojson.coordinates && obs.geojson.coordinates[0],
      privateLatitude: obs.private_geojson && obs.private_geojson.coordinates
                      && obs.private_geojson.coordinates[1],
      privateLongitude: obs.private_geojson && obs.private_geojson.coordinates
                      && obs.private_geojson.coordinates[0],
      observationPhotos,
      taxon
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

    const addTimestampsToEvidence = evidence => ( evidence
      ? evidence.map( record => ( {
        ...record,
        ...timestamps
      } ) )
      : evidence );

    const taxon = obs.taxon || null;
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
  };

  static mediumUri = obs => {
    const photo = obs.observation_photos[0];
    if ( !photo ) { return null; }
    if ( !photo.photo ) { return null; }
    if ( !photo.photo.url ) { return null; }

    const mediumUri = obs.observation_photos[0].photo.url.replace( "square", "medium" );

    return { uri: mediumUri };
  };

  static filterUnsyncedObservations = realm => {
    const unsyncedFilter = "_synced_at == null || _synced_at <= _updated_at";
    const photosUnsyncedFilter = "ANY observationPhotos._synced_at == null";

    const obs = realm.objects( "Observation" );
    const unsyncedObs = obs.filtered( `${unsyncedFilter} || ${photosUnsyncedFilter}` );
    return unsyncedObs;
  };

  static isUnsyncedObservation = ( realm, obs ) => {
    const obsList = Observation.filterUnsyncedObservations( realm );
    const unsyncedObs = obsList.filtered( `uuid == "${obs.uuid}"` );
    return unsyncedObs.length > 0;
  };

  static createObservationFromGalleryPhoto = async photo => {
    const firstPhotoExif = await parseExif( photo?.image?.uri );

    const { latitude, longitude } = firstPhotoExif;

    const newObservation = {
      latitude,
      longitude,
      observed_on_string: formatExifDateAsString( firstPhotoExif.date ) || null
    };

    if ( firstPhotoExif.positional_accuracy ) {
      // $FlowIgnore
      newObservation.positional_accuracy = firstPhotoExif.positional_accuracy;
    }
    return Observation.new( newObservation );
  };

  static createObservationWithPhotos = async photos => {
    const newLocalObs = await Observation.createObservationFromGalleryPhoto( photos[0] );
    newLocalObs.observationPhotos = await ObservationPhoto
      .createObsPhotosWithPosition( photos, { position: 0 } );
    return newLocalObs;
  };

  static appendObsPhotos = ( obsPhotos, currentObservation ) => {
    const updatedObs = (currentObservation instanceof Realm.Object
                        ? currentObservation.toJSON( ) : currentObservation);

    // need empty case for when a user creates an observation with no photos,
    // then tries to add photos to observation later
    const currentObservationPhotos = updatedObs?.observationPhotos || [];

    updatedObs.observationPhotos = [...currentObservationPhotos, ...obsPhotos];
    return updatedObs;
  };

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
      created_at: { type: "string", mapTo: "createdAt", optional: true },
      description: "string?",
      faves: "Vote[]",
      geoprivacy: "string?",
      id: "int?",
      identifications: "Identification[]",
      latitude: "double?",
      license_code: { type: "string", mapTo: "licenseCode", optional: true },
      longitude: "double?",
      observationPhotos: "ObservationPhoto[]",
      observationSounds: "ObservationSound[]",
      // date and/or time submitted to the server when a new obs is uploaded
      observed_on_string: "string?",
      observed_on: "string?",
      obscured: "bool?",
      owners_identification_from_vision: "bool?",
      species_guess: "string?",
      place_guess: { type: "string", mapTo: "placeGuess", optional: true },
      positional_accuracy: "double?",
      quality_grade: { type: "string", mapTo: "qualityGrade", optional: true },
      taxon: "Taxon?",
      // datetime when the observer observed the organism; user-editable, but
      // only by changing observed_on_string
      time_observed_at: { type: "string", mapTo: "timeObservedAt", optional: true },
      user: "User?",
      updated_at: "date?",
      comments_viewed: "bool?",
      identifications_viewed: { type: "bool", mapTo: "identificationsViewed", optional: true },
      viewer_trusted_by_observer: {
        type: "bool",
        mapTo: "viewerTrustedByObserver",
        optional: true
      },
      private_place_guess: { type: "string", mapTo: "privatePlaceGuess", optional: true },
      private_location: { type: "string", mapTo: "privateLocation", optional: true },
      privateLatitude: "double?",
      privateLongitude: "double?"
    }
  };

  needsSync( ) {
    const obsPhotosNeedSync = this.observationPhotos
      .filter( obsPhoto => obsPhoto.needsSync( ) ).length > 0;
    return !this._synced_at || this._synced_at <= this._updated_at || obsPhotosNeedSync;
  }

  wasSynced( ) {
    return this._synced_at !== null;
  }

  viewed() {
    return this.comments_viewed && this.identifications_viewed;
  }

  unviewed() {
    return !this.viewed();
  }
}

export default Observation;
