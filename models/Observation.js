class Observation {
  constructor( obs ) {
    this.uuid = obs.uuid;
    // this.comments = obs.comments;
    this.commentCount = obs.comment_count || 0;
    this.commonName = obs.taxon.preferred_common_name || obs.taxon.name;
    this.createdAt = obs.created_at;
    this.identificationCount = obs.identifications.length;
    this.location = obs.place_guess;
    this.qualityGrade = obs.quality_grade;
    this.taxonRank = obs.taxon.rank;
    this.timeObservedAt = obs.observed_on;
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
      identificationCount: "int",
      location: "string",
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
