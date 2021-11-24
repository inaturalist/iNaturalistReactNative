import Comment from "./Comment";
import Identification from "./Identification";
import ObservationPhoto from "./ObservationPhoto";
import Taxon from "./Taxon";

class Observation {
  static createObservationForRealm( obs, realm ) {
    const createLinkedObjects = ( list, createFunction ) => {
      if ( list.length === 0 ) { return; }
      return list.map( item => {
        return createFunction.mapApiToRealm( item, realm, "obs" );
      } );
    };

    const taxon = Taxon.mapApiToRealm( obs.taxon, realm );
    const observationPhotos = createLinkedObjects( obs.observation_photos, ObservationPhoto );
    const comments = createLinkedObjects( obs.comments, Comment, realm );
    const identifications = createLinkedObjects( obs.identifications, Identification );

    return {
      uuid: obs.uuid,
      comments,
      createdAt: obs.created_at,
      description: obs.description,
      identifications,
      // obs detail on web says geojson coords are preferred over lat/long
      // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/ducks/observation.js#L145
      latitude: obs.geojson.coordinates[1],
      longitude: obs.geojson.coordinates[0],
      observationPhotos,
      // photos,
      placeGuess: obs.place_guess,
      qualityGrade: obs.quality_grade,
      taxon,
      timeObservedAt: obs.time_observed_at
    };
  }

  static schema = {
    name: "Observation",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      comments: "Comment[]",
      createdAt: "string?",
      description: "string?",
      identifications: "Identification[]",
      latitude: "double?",
      longitude: "double?",
      observationPhotos: "ObservationPhoto[]",
      placeGuess: "string?",
      qualityGrade: "string?",
      taxon: "Taxon?",
      timeObservedAt: "string?"
    }
  }
}

export default Observation;
