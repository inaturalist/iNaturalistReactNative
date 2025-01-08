import { Realm } from "@realm/react";

class TaxonPhoto extends Realm.Object {
  static schema = {
    name: "TaxonPhoto",
    embedded: true,
    properties: {
      // datetime the taxonPhoto was created on the device
      _created_at: "date?",
      // datetime the taxonPhoto was last synced with the server
      _synced_at: "date?",
      // datetime the taxonPhoto was updated on the device (i.e. edited locally)
      _updated_at: "date?",
      id: "int?",
      photo: "Photo?",
      // this creates an inverse relationship so taxon photos
      // automatically keep track of which Taxon they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Taxon",
        property: "taxonPhotos"
      }
    }
  };
}

export default TaxonPhoto;
