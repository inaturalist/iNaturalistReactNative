import User from "./User";
import Taxon from "./Taxon";
class Identification {
  static copyRealmSchema( id ) {
    return {
      uuid: id.uuid,
      body: id.body,
      category: id.category,
      createdAt: id.created_at,
      id: id.id,
      taxon: Taxon.mapApiToRealm( id.taxon ),
      user: User.mapApiToRealm( id.user ),
      vision: id.vision
    };
  }

  static mapApiToRealm( id, realm ) {
    return {
      uuid: id.uuid,
      body: id.body,
      category: id.category,
      created_at: id.created_at,
      id: id.id,
      // need to append Taxon object to identifications after the Observation object
      // has been created with its own Taxon object, otherwise will run into errors
      // with realm trying to create a Taxon object with an existing primary key
      user: User.mapApiToRealm( id.user, realm ),
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
      created_at: { type: "string?", mapTo: "createdAt" },
      taxon: "Taxon?",
      user: "User?",
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
