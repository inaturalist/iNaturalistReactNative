import { Realm } from "@realm/react";
import * as uuid from "uuid";

import Flag from "./Flag";
import Taxon from "./Taxon";
import User from "./User";

class Identification extends Realm.Object {
  static ID_FIELDS = {
    body: true,
    category: true,
    created_at: true,
    current: true,
    disagreement: true,
    hidden: true,
    id: true,
    flags: Flag.FLAG_FIELDS,
    previous_observation_taxon: Taxon.TAXON_FIELDS,
    taxon: Taxon.TAXON_FIELDS,
    updated_at: true,
    // $FlowFixMe
    user: User && ( { ...User.FIELDS, id: true } ),
    uuid: true,
    vision: true
  };

  static mimicRealmMappedPropertiesSchema( id ) {
    return {
      ...id,
      createdAt: id.created_at,
      flags: id.flags || [],
      taxon: Taxon.mapApiToRealm( id.taxon )
    };
  }

  static mapIdentificationForMyObsAdvancedMode( id ) {
    return {
      uuid: id.uuid,
      current: id.current
    };
  }

  static new = attrs => {
    const newIdent = {
      ...attrs,
      uuid: uuid.v4( )
    };

    return newIdent;
  };

  static schema = {
    name: "Identification",
    embedded: true,
    properties: {
      uuid: "string",
      body: "string?",
      category: "string?",
      current: "bool",
      created_at: { type: "string", mapTo: "createdAt", optional: true },
      disagreement: "bool?",
      flags: "Flag[]",
      hidden: "bool?",
      id: "int?",
      previous_observation_taxon: "Taxon?",
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
  };
}

export default Identification;
