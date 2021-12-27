// @flow

import Comment from "./Comment";
import Identification from "./Identification";
import Observation from "./Observation";
import ObservationPhoto from "./ObservationPhoto";
import Photo from "./Photo";
import Taxon from "./Taxon";
import User from "./User";

export default {
  schema: [
    Comment,
    Identification,
    Observation,
    ObservationPhoto,
    Photo,
    Taxon,
    User
  ],
  schemaVersion: 3,
  path: "db.realm",
  migration: ( oldRealm: any, newRealm: any ) => {
    if ( oldRealm.schemaVersion < 3 ) {
      const oldObjects = oldRealm.objects( "Comment" );
      const newObjects = newRealm.objects( "Comment" );
      // loop through all objects and set the new property in the new schema
      for ( const objectIndex in oldObjects ) {
        const oldObject = oldObjects[objectIndex];
        const newObject = newObjects[objectIndex];
        newObject.created_at = oldObject.createdAt;
      }
    }
  }
};
