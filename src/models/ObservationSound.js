class ObservationSound {
  static mapApiToRealm( observationSound ) {
    return observationSound;
  }

  // TODO: does sound need a uuid? it has one in iNaturalistIOS
  // https://github.com/inaturalist/INaturalistIOS/blob/1b52a28ea70908119930348a4c4f4242eb3ca47b/INaturalistIOS/ExploreObservationSound.h
  static schema = {
    name: "ObservationSound",
    // primaryKey: "uuid",
    properties: {
      // uuid: "string",
      id: "int?",
      file_url: { type: "string", mapTo: "fileUrl" },
      // this creates an inverse relationship so observation sounds
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "observationSounds"
      }
    }
  }
}

export default ObservationSound;
