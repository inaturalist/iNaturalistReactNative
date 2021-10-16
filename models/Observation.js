class Observation {
  constructor( obs ) {
    this.uuid = obs.uuid;
    this.userPhoto = obs.photos[0].url;
    this.commonName = obs.taxon.preferred_common_name || obs.taxon.name;
    this.location = obs.place_guess;
    this.timeObservedAt = obs.observed_on;
    this.identifications = obs.identifications.length;
    this.comments = obs.comment_count || 0;
    this.qualityGrade = obs.quality_grade;
    this.geoprivacy = obs.geoprivacy;
    this.positionalAccuracy = obs.positional_accuracy;
  }

  static schema = {
    name: "Observation",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      userPhoto: "string",
      commonName: "string",
      location: "string",
      timeObservedAt: "string",
      identifications: "int",
      comments: "int",
      qualityGrade: "string"
    }
  }
}

export default Observation;
