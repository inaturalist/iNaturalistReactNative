import Identification from "./Identification";
import Photo from "./Photo";
import Comment from "./Comment";

class Observation {
  static createObservationForRealm( obs ) {
    const createLinkedObjects = ( list, createFunction ) => {
      if ( list.length === 0 ) { return; }
      return list.map( item => {
        return createFunction.createObjectForRealm( item );
      } );
    };

    const identifications = createLinkedObjects( obs.identifications, Identification );
    const photos = createLinkedObjects( obs.photos, Photo );
    const comments = createLinkedObjects( obs.comments, Comment );

    return {
      uuid: obs.uuid,
      commentCount: obs.comment_count || 0,
      comments,
      commonName: obs.taxon.preferred_common_name,
      createdAt: obs.created_at,
      description: obs.description,
      identificationCount: obs.identifications.length,
      identifications,
      // obs detail on web says geojson coords are preferred over lat/long
      // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/ducks/observation.js#L145
      latitude: obs.geojson.coordinates[1],
      location: obs.location,
      longitude: obs.geojson.coordinates[0],
      photos,
      placeGuess: obs.place_guess,
      qualityGrade: obs.quality_grade,
      taxonRank: obs.taxon.rank,
      timeObservedAt: obs.time_observed_at,
      userProfilePhoto: obs.user.icon_url,
      userLogin: obs.user.login,
      userPhoto: obs.photos[0].url
    };
  }

  static schema = {
    name: "Observation",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      commentCount: "int",
      comments: "Comment[]",
      commonName: "string?",
      createdAt: "string",
      description: "string?",
      identifications: "Identification[]",
      identificationCount: "int",
      latitude: "double?",
      location: "string",
      longitude: "double?",
      photos: "Photo[]",
      placeGuess: "string",
      qualityGrade: "string",
      taxonRank: "string",
      timeObservedAt: "string",
      userProfilePhoto: "string",
      userLogin: "string",
      userPhoto: "string"
    }
  }
}

export default Observation;
