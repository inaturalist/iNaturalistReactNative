class Taxon {
  static mapApiToRealm( taxon, realm ) {
    const existingTaxon = realm && realm.objectForPrimaryKey( "Taxon", taxon.id );
    if ( existingTaxon ) { return existingTaxon; }
    return {
      defaultPhotoSquareUrl: taxon.default_photo.square_url,
      id: taxon.id,
      name: taxon.name,
      preferredCommonName: taxon.preferred_common_name,
      rank: taxon.rank
    };
  }

  static schema = {
    name: "Taxon",
    primaryKey: "id",
    properties: {
      id: "int",
      defaultPhotoSquareUrl: "string?",
      name: "string?",
      preferredCommonName: "string?",
      rank: "string?"
    }
  }
}

export default Taxon;
