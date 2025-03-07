import { Realm } from "@realm/react";

import Taxon from "./Taxon";

class SpeciesCount extends Realm.Object {
  static SPECIES_COUNT_FIELDS = {
    user_id: true,
    fields: {
      taxon: Taxon.LIMITED_TAXON_FIELDS
    }
  };

  static mapApiToRealm( speciesCount, realm = null ) {
    console.log( "realm map", speciesCount );
    const count = {
      count: speciesCount.count,
      taxon: Taxon.mapApiToRealm( speciesCount?.taxon, realm )
    };
    return count;
  }

  static schema = {
    name: "SpeciesCount",
    properties: {
      count: "int",
      taxon: "Taxon?"
    }
  };
}

export default SpeciesCount;
