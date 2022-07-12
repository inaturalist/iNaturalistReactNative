import uuid from "react-native-uuid";
import Realm from "realm";

// eslint-disable-next-line import/no-cycle
import { getUserId } from "../components/LoginSignUp/AuthenticationService";
import { createObservedOnStringForUpload, formatDateAndTime } from "../sharedHelpers/dateAndTime";
import fetchUserLocation from "../sharedHelpers/fetchUserLocation";
// eslint-disable-next-line import/no-cycle
import Comment from "./Comment";
// eslint-disable-next-line import/no-cycle
import Identification from "./Identification";
import ObservationPhoto from "./ObservationPhoto";
import ObservationSound from "./ObservationSound";
import Taxon from "./Taxon";
// eslint-disable-next-line import/no-cycle
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
    // TODO remove this from the model. IMO this kind of system interaction
    // should happen in the component
    const latLng = await fetchUserLocation( );

    return {
      ...obs,
      ...latLng,
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

  static async formatObsPhotos( photos ) {
    return Promise.all( photos.map( async photo => {
      // photo.image?.uri is for gallery photos; photo is for normal camera
      const uri = photo.image?.uri || photo;
      return ObservationPhoto.new( uri );
    } ) );
  }

  static async createMutipleObsFromGalleryPhotos( obs ) {
    return Promise.all( obs.map( async ( { photos } ) => {
      // take the observed_on_string time from the first photo in an observation
      const observedOn = formatDateAndTime( photos[0].timestamp );
      const obsPhotos = await Observation.formatObsPhotos( photos );
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

  static createObservationForRealm( obs, realm ) {
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

    const newObs = {
      ...obs,
      // this time is used for sorting observations in ObsList
      _created_at: obs.created_at,
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
    return newObs;
  }

  static async saveLocalObservationForUpload( obs, realm ) {
    // make sure local observations have user details for ObsDetail
    const id = await getUserId( );
    const user = id && realm.objectForPrimaryKey( "User", Number( id ) );
    if ( user ) {
      obs.user = user;
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
      user: "User?"

      // need project ids, but skipping this for now
      // to get rest of upload working
      // project_ids
      // note that taxon_id is nested under Taxon
    }
  }
}

export default Observation;
