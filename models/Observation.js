class Observation {
  constructor( obs ) {
    console.log( obs.geojson.coordinates, "obs geojson in model" );
    this.uuid = obs.uuid;
    // this.comments = obs.comments;
    this.commentCount = obs.comment_count || 0;
    this.commonName = obs.taxon.preferred_common_name || obs.taxon.name;
    this.createdAt = obs.created_at;
    this.description = obs.description;
    this.identificationCount = obs.identifications.length;
    // obs detail on web says geojson coords are preferred over lat/long
    // https://github.com/inaturalist/inaturalist/blob/df6572008f60845b8ef5972a92a9afbde6f67829/app/webpack/observations/show/ducks/observation.js#L145
    this.latitude = obs.geojson.coordinates[1];
    this.location = obs.location;
    this.longitude = obs.geojson.coordinates[0];
    this.placeGuess = obs.place_guess;
    this.qualityGrade = obs.quality_grade;
    this.taxonRank = obs.taxon.rank;
    this.timeObservedAt = obs.time_observed_at;
    this.userProfilePhoto = obs.user.icon_url;
    this.userLogin = obs.user.login;
    this.userPhoto = obs.photos[0].url;
  }

  static schema = {
    name: "Observation",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      commentCount: "int",
      // comments: "Comment?",
      commonName: "string",
      createdAt: "string",
      description: "string",
      identificationCount: "int",
      latitude: "double?",
      location: "string",
      longitude: "double?",
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
