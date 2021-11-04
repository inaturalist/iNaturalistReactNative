class Identification {
  static schema = {
    name: "Identification",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      body: "string?",
      category: "string",
      commonName: "string?",
      createdAt: "string",
      name: "string",
      rank: "string",
      taxonPhoto: "string",
      userIcon: "string?",
      userLogin: "string",
      vision: "bool",
      // this creates an inverse relationship so identifications
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "identifications"
      }
    }
  }
}

export default Identification;
