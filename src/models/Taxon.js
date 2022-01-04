import Photo from "./Photo";
class Taxon {
  static copyRealmSchema( taxon ) {
    return {
      default_photo: Photo.mapApiToRealm( taxon.default_photo ),
      id: taxon.id,
      name: taxon.name,
      preferredCommonName: taxon.preferred_common_name,
      rank: taxon.rank
    };
  }

  static mapApiToRealm( taxon, realm ) {
    const existingTaxon = realm && realm.objectForPrimaryKey( "Taxon", taxon.id );
    if ( existingTaxon ) { return existingTaxon; }
    return {
      ...taxon,
      default_photo: Photo.mapApiToRealm( taxon.default_photo )
    };
  }

  static uri = ( item ) => ( item && item.default_photo ) && { uri: item.default_photo.url };

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
