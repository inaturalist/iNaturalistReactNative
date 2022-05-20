import Realm from "realm";

import User from "./User";
import Taxon from "./Taxon";
class Identification extends Realm.Object {
  static ID_FIELDS = {
    body: true,
    category: true,
    created_at: true,
    current: true,
    disagreement: true,
    taxon: Taxon.TAXON_FIELDS,
    updated_at: true,
    // $FlowFixMe
    user: Object.assign( { }, User.USER_FIELDS, { id: true } ),
    uuid: true,
    vision: true
  };

  static mimicRealmMappedPropertiesSchema( id ) {
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
      taxon: Taxon.mapApiToRealm( id.taxon ),
      user: User.mapApiToRealm( id.user, realm )
    };
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
