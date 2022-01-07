import User from "./User";
import Taxon from "./Taxon";
class Identification {
  static copyRealmSchema( id ) {
    return {
      ...id,
      createdAt: id.created_at,
      taxon: Taxon.mapApiToRealm( id.taxon ),
      user: User.mapApiToRealm( id.user )
    };
  }

  static mapApiToRealm( id, realm ) {
    const newId = {
      ...id,
      user: User.mapApiToRealm( id.user, realm )
    };
    // need to append Taxon object to identifications after the Observation object
    // has been created with its own Taxon object, otherwise will run into errors
    // with realm trying to create a Taxon object with an existing primary key
    delete newId.taxon;
    return newId;
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
