import { Realm } from "@realm/react";
import { Alert } from "react-native";
import { getNowISO } from "sharedHelpers/dateAndTime.ts";
import { log } from "sharedHelpers/logger";
import { readExifFromMultiplePhotos } from "sharedHelpers/parseExif";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import * as uuid from "uuid";

import Application from "./Application";
import Comment from "./Comment";
import Identification from "./Identification";
import ObservationPhoto from "./ObservationPhoto";
import ObservationSound from "./ObservationSound";
import Sound from "./Sound";
import Taxon from "./Taxon";
import User from "./User";
import Vote from "./Vote";

export const GEOPRIVACY_OPEN = "open";
export const GEOPRIVACY_OBSCURED = "obscured";
export const GEOPRIVACY_PRIVATE = "private";

const logger = log.extend( "index.js" );

// noting that methods like .toJSON( ) are only accessible when the model
// class is extended with Realm.Object per this issue:
// https://github.com/realm/realm-js/issues/3600#issuecomment-785828614
class Observation extends Realm.Object {
  static PROJECT_FIELDS = {
    id: true,
    icon: true,
    title: true,
    project_type: true
  };

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
    obscured: true,
    observation_photos: ObservationPhoto.OBSERVATION_PHOTOS_FIELDS,
    observed_on: true,
    place_guess: true,
    quality_grade: true,
    observation_sounds: ObservationSound.OBSERVATION_SOUNDS_FIELDS,
    observed_time_zone: true,
    taxon: Taxon.TAXON_FIELDS,
    taxon_geoprivacy: true,
    time_observed_at: true,
    user: User && {
      ...User.FIELDS,
      preferences: {
        prefers_community_taxa: true
      }
    },
    updated_at: true,
    viewer_trusted_by_observer: true,
    votes: Vote.VOTE_FIELDS,
    private_geojson: true,
    private_location: true,
    private_place_guess: true,
    project_ids: true,
    project_observations: {
      project: Observation.PROJECT_FIELDS
    },
    non_traditional_projects: {
      project: Observation.PROJECT_FIELDS
    },
    positional_accuracy: true,
    preferences: {
      prefers_community_taxon: true
    }
  };

  static EXPLORE_LIST_FIELDS = {
    created_at: true,
    comments: {
      current: true
    },
    geojson: true,
    geoprivacy: true,
    id: true,
    identifications: {
      current: true
    },
    latitude: true,
    longitude: true,
    observation_photos: ObservationPhoto.OBSERVATION_PHOTOS_FIELDS,
    observed_time_zone: true,
    place_guess: true,
    quality_grade: true,
    obscured: true,
    observation_sounds: {
      id: true
    },
    taxon: {
      iconic_taxon_name: true,
      is_active: true,
      name: true,
      preferred_common_name: true,
      rank: true,
      rank_level: true
    },
    taxon_geoprivacy: true,
    time_observed_at: true
  };

  static LIST_FIELDS = {
    ...Observation.EXPLORE_LIST_FIELDS,
    comments: Comment.COMMENT_FIELDS,
    created_at: true,
    identifications: Identification.ID_FIELDS,
    observation_sounds: ObservationSound.OBSERVATION_SOUNDS_FIELDS,
    private_geojson: true,
    private_place_guess: true,
    taxon: Taxon.TAXON_FIELDS,
    user: User && User.FIELDS
  };

  static DEFAULT_MODE_LIST_FIELDS = {
    observation_sounds: {
      uuid: true
    },
    observation_photos: {
      id: true,
      photo: {
        id: true,
        url: true
      },
      uuid: true
    },
    taxon: {
      iconic_taxon_name: true,
      name: true,
      preferred_common_name: true
    },
    quality_grade: true
  };

  static async new( obs ) {
    return {
      ...obs,
      captive_flag: false,
      geoprivacy: GEOPRIVACY_OPEN,
      owners_identification_from_vision: false,
      observed_on: obs?.observed_on,
      observed_on_string: obs
        ? obs?.observed_on_string
        : getNowISO( ),
      quality_grade: "needs_id",
      needs_sync: true,
      uuid: uuid.v4( )
    };
  }

  static async createObsWithSoundPath( soundPath ) {
    const observation = await Observation.new( );
    const sound = await ObservationSound.new( {
      sound: await Sound.new( { file_url: soundPath } )
    } );
    observation.observationSounds = [sound];
    return observation;
  }

  static upsertRemoteObservations( remoteObservations, realm, options = {} ) {
    if ( !remoteObservations ) return;
    if ( remoteObservations.length === 0 ) return;
    const obsToUpsert = options.force
      ? remoteObservations
      : remoteObservations.filter( obs => !Observation.isUnsyncedObservation( realm, obs ) );
    // const msg = obsToUpsert.map( remoteObservation => {
    //   const obsPhotoUUIDs = remoteObservation.observation_photos?.map( op => op.uuid );
    //   return `obs ${remoteObservation.uuid}, ops: ${obsPhotoUUIDs}`;
    // } );
    // Trying to debug disappearing photos
    safeRealmWrite( realm, ( ) => {
      obsToUpsert.forEach( remoteObservation => {
        const obsMappedForRealm = Observation.mapApiToRealm( remoteObservation, realm );
        realm.create(
          "Observation",
          obsMappedForRealm,
          "modified"
        );
      } );
    }, "upserting remote observations in Observation" );
  }

  static mapApiToRealm( obs, realm = null ) {
    if ( !obs ) return obs;
    const existingObs = realm?.objectForPrimaryKey( "Observation", obs.uuid );
    const taxon = obs.taxon
      ? Taxon.mapApiToRealm( obs.taxon, realm )
      : null;
    const observationPhotos = (
      obs.observation_photos || obs.observationPhotos || []
    ).map( obsPhoto => {
      const mappedObsPhoto = ObservationPhoto.mapApiToRealm( obsPhoto, realm );
      const existingObsPhoto = existingObs?.observationPhotos?.find(
        op => op.uuid === obsPhoto.uuid
      );
      if ( !existingObsPhoto ) {
        mappedObsPhoto._created_at = new Date( );
        mappedObsPhoto.photo._created_at = new Date( );
      }
      return mappedObsPhoto;
    } );

    const observationSounds = (
      obs.observation_sounds || obs.observationSounds || []
    ).map( obsSound => {
      const mappedObsSound = ObservationSound.mapApiToRealm( obsSound, realm );
      const existingObsSound = existingObs?.observationSounds?.find(
        os => os.uuid === obsSound.uuid
      );
      if ( !existingObsSound ) {
        mappedObsSound._created_at = new Date( );
        mappedObsSound.sound._created_at = new Date( );
      }
      return mappedObsSound;
    } );

    const identifications = obs.identifications
      ? obs.identifications.map( id => Identification.mapApiToRealm( id, realm ) )
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
      observationSounds,
      prefers_community_taxon: obs.preferences?.prefers_community_taxon,
      taxon
    };

    if ( localObs.user ) {
      localObs.user.prefers_community_taxa = (
        localObs.user.prefers_community_taxa
        || localObs.user.preferences?.prefers_community_taxa
      );
    }

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
      needs_sync: true,
      taxon,
      observationPhotos,
      observationSounds
    };

    safeRealmWrite( realm, ( ) => {
      // using 'modified' here for the case where a new observation has the same Taxon
      // as a previous observation; otherwise, realm will error out
      // also using modified for updating observations which were already saved locally
      realm.create( "Observation", obsToSave, "modified" );
    }, "saving local observation for upload in Observation" );
    return realm.objectForPrimaryKey( "Observation", obs.uuid );
  }

  static mapObservationForUpload( obs ) {
    return {
      captive_flag: obs.captive_flag,
      description: obs.description,
      geoprivacy: obs.geoprivacy,
      latitude: obs.latitude,
      longitude: obs.longitude,
      observed_on_string: obs.observed_on_string,
      owners_identification_from_vision: obs.owners_identification_from_vision,
      place_guess: obs.place_guess,
      positional_accuracy: obs.positional_accuracy,
      species_guess: obs.species_guess,
      taxon_id: obs.taxon && obs.taxon.id,
      uuid: obs.uuid
    };
  }

  // static mapObservationForFlashList( obs ) {
  //   return {
  //     _created_at: obs._created_at,
  //     _deleted_at: obs._deleted_at,
  //     _synced_at: obs._synced_at,
  //     _updated_at: obs._updated_at,
  //     uuid: obs.uuid,
  //     comments: obs.comments,
  //     description: obs.description,
  //     geoprivacy: obs.geoprivacy,
  //     id: obs.id,
  //     identifications: obs.identifications,
  //     latitude: obs.latitude,
  //     longitude: obs.longitude,
  //     observationPhotos: obs.observationPhotos,
  //     observationSounds: obs.observationSounds,
  //     observed_on_string: obs.observed_on_string,
  //     obscured: obs.obscured,
  //     place_guess: obs.place_guess,
  //     positional_accuracy: obs.positional_accuracy,
  //     quality_grade: obs.quality_grade,
  //     taxon: obs.taxon,
  //     time_observed_at: obs.time_observed_at,
  //     comments_viewed: obs.comments_viewed,
  //     identifications_viewed: obs.identifications_viewed,
  //     privateLatitude: obs.privateLatitude,
  //     privateLongitude: obs.privateLongitude
  //   };
  // }

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
    const soundsUnsyncedFilter = "ANY observationSounds._synced_at == null";

    const obs = realm.objects( "Observation" );
    // we sort unsynced observations here to make sure observations
    // with an older _created_at date get uploaded first
    const unsyncedObs = obs.filtered(
      `${unsyncedFilter} || ${photosUnsyncedFilter} || ${soundsUnsyncedFilter}`
    ).sorted( "_created_at", true );
    return unsyncedObs;
  };

  static isUnsyncedObservation = ( realm, obs ) => {
    const obsList = Observation.filterUnsyncedObservations( realm );
    const unsyncedObs = obsList.filtered( `uuid == "${obs.uuid}"` );
    return unsyncedObs.length > 0;
  };

  static createObservationFromGalleryPhotos = async photos => {
    const photoUris = photos.map( photo => photo?.image?.uri );
    try {
      const newObservation = await readExifFromMultiplePhotos( photoUris );
      return Observation.new( newObservation );
    } catch ( createObservationFromGalleryError ) {
      logger.error(
        "Error reading EXIF from multiple gallery photos",
        createObservationFromGalleryError
      );
      Alert.alert(
        "Creating Observation from Gallery Error",
        createObservationFromGalleryError.message
      );
      return null;
    }
  };

  static createObservationWithPhotos = async photos => {
    const newLocalObs = await Observation.createObservationFromGalleryPhotos( photos );
    newLocalObs.observationPhotos = await ObservationPhoto
      .createObsPhotosWithPosition( photos, { position: 0 } );
    return newLocalObs;
  };

  static updateObsExifFromPhotos = async ( photoUris, currentObservation ) => {
    const updatedObs = currentObservation;

    const unifiedExif = await readExifFromMultiplePhotos( photoUris );

    if ( unifiedExif.latitude && !currentObservation.latitude ) {
      updatedObs.latitude = unifiedExif.latitude;
    }
    if ( unifiedExif.longitude && !currentObservation.longitude ) {
      updatedObs.longitude = unifiedExif.longitude;
    }
    if ( unifiedExif.observed_on_string && !currentObservation.observed_on_string ) {
      updatedObs.observed_on_string = unifiedExif.observed_on_string;
    }
    if ( unifiedExif.positional_accuracy && !currentObservation.positional_accuracy ) {
      updatedObs.positional_accuracy = unifiedExif.positional_accuracy;
    }

    return updatedObs;
  };

  static appendObsPhotos = ( obsPhotos, currentObservation ) => {
    const updatedObs = currentObservation;

    // need empty case for when a user creates an observation with no photos,
    // then tries to add photos to observation later
    const currentObservationPhotos = updatedObs?.observationPhotos || [];

    updatedObs.observationPhotos = [...currentObservationPhotos, ...obsPhotos];
    return updatedObs;
  };

  static appendObsSounds = ( obsSounds, currentObservation ) => {
    const updatedObs = currentObservation;

    // need empty case for when a user creates an observation with no sounds,
    // then tries to add sounds to observation later
    const currentObservationSounds = updatedObs?.observationSounds || [];

    updatedObs.observationSounds = [...currentObservationSounds, ...obsSounds];
    return updatedObs;
  };

  static deleteLocalObservation = ( realm, uuidToDelete ) => {
    const observation = realm?.objectForPrimaryKey( "Observation", uuidToDelete );
    if ( observation ) {
      safeRealmWrite( realm, ( ) => {
        realm?.delete( observation );
      }, `deleting local observation ${uuidToDelete} in deleteLocalObservation` );
    }
  };

  static markPendingDeletion( realm, uuidToDelete ) {
    const observation = realm.objectForPrimaryKey( "Observation", uuidToDelete );
    if ( observation ) {
      safeRealmWrite( realm, ( ) => {
        observation._pending_deletion = true;
      } );
    }
  }

  static clearPendingDeletion( realm, uuidToDelete ) {
    const observation = realm.objectForPrimaryKey( "Observation", uuidToDelete );
    if ( observation ) {
      safeRealmWrite( realm, ( ) => {
        observation._pending_deletion = false;
      } );
    }
  }

  static schema = {
    name: "Observation",
    primaryKey: "uuid",
    properties: {
      _pending_deletion: "bool?",
      // datetime the observation was created on the device
      _created_at: "date?",
      // datetime the observation was requested to be deleted
      _deleted_at: "date?",
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
      observed_time_zone: "string?",
      obscured: "bool?",
      owners_identification_from_vision: "bool?",
      species_guess: "string?",
      place_guess: { type: "string", mapTo: "placeGuess", optional: true },
      positional_accuracy: "double?",
      prefers_community_taxon: "bool?",
      quality_grade: { type: "string", mapTo: "qualityGrade", optional: true },
      taxon: "Taxon?",
      taxon_geoprivacy: "string?",
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
      votes: "Vote[]",
      private_place_guess: { type: "string", mapTo: "privatePlaceGuess", optional: true },
      private_location: { type: "string", mapTo: "privateLocation", optional: true },
      privateLatitude: "double?",
      privateLongitude: "double?",
      needs_sync: { type: "bool", default: false, indexed: true }
    }
  };

  needsSync( ) {
    const obsPhotosNeedSync = this.observationPhotos
      .filter( obsPhoto => obsPhoto.needsSync( ) ).length > 0;
    const obsSoundsNeedSync = this.observationSounds
      .filter( obsSound => obsSound.needsSync( ) ).length > 0;
    return !this._synced_at
      || this._synced_at <= this._updated_at
      || obsPhotosNeedSync
      || obsSoundsNeedSync;
  }

  updateNeedsSync() {
    this.needsSync = this.needsSync();
  }

  wasSynced( ) {
    return this._synced_at !== null;
  }

  viewed() {
    return !!( this.comments_viewed && this.identifications_viewed );
  }

  unviewed() {
    return !this.viewed();
  }

  // Faves are the subset of votes for which vote_scope is null
  faves() {
    return this.votes.filter( vote => vote?.vote_scope === null );
  }

  missingBasics() {
    const missingDate = !Date.parse( this.observed_on_string ) && !this.time_observed_at;
    const missingCoords = typeof ( this.latitude ) !== "number"
      && typeof ( this.privateLatitude ) !== "number";
    return missingDate || missingCoords;
  }
}

export default Observation;
