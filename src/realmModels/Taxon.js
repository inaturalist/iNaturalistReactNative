import { Realm } from "@realm/react";

import Photo from "./Photo";

class Taxon extends Realm.Object {
  static TAXON_FIELDS = {
    default_photo: {
      id: true,
      url: true,
      attribution: true,
      license_code: true
    },
    iconic_taxon_name: true,
    name: true,
    preferred_common_name: true,
    rank: true,
    rank_level: true
  };

  static mimicRealmMappedPropertiesSchema( taxon ) {
    return {
      ...taxon,
      default_photo: Photo.mapApiToRealm( taxon?.default_photo ),
      preferredCommonName: taxon.preferred_common_name
    };
  }

  static mapApiToRealm( taxon ) {
    return {
      ...taxon,
      default_photo: Photo.mapApiToRealm( taxon?.default_photo )
    };
  }

  static uri = item => ( item && item.default_photo ) && { uri: item.default_photo.url };

  static schema = {
    name: "Taxon",
    primaryKey: "id",
    properties: {
      id: "int",
      default_photo: { type: "Photo?", mapTo: "defaultPhoto" },
      name: "string?",
      preferred_common_name: { type: "string?", mapTo: "preferredCommonName" },
      rank: "string?"
    }
  }
}

export default Taxon;
