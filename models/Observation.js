class Observation {
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
