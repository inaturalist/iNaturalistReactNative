import Taxon from "./Taxon";
class Identification {
  static createObjectForRealm( id ) {
    return {
      uuid: id.uuid,
      body: id.body,
      category: id.category,
      createdAt: id.created_at,
      id: id.id,
      taxon: Taxon.createObjectForRealm( id.taxon ),
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
      createdAt: "string?",
      taxon: "Taxon?",
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
