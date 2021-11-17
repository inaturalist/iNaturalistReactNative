class Identification {
  static createObjectForRealm( id ) {
    return {
      uuid: id.uuid,
      body: id.body,
      category: id.category,
      commonName: id.taxon.preferred_common_name,
      createdAt: id.created_at,
      id: id.id,
      name: id.taxon.name,,,,
      rank: id.taxon.rank,
      taxonPhoto: id.taxon.default_photo.square_url,
      userIcon: id.user.icon_url,
      userLogin: id.user.login,
      vision: id.vision
    };
  }

  static schema = {
    name: "Identification",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
      body: "string?",
      category: "string?",
      commonName: "string?",
      createdAt: "string?",
      name: "string?",
      rank: "string?",
      taxonPhoto: "string?",
      userIcon: "string?",
      userLogin: "string?",
      vision: "bool?",
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
