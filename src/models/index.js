// @flow

import Comment from "./Comment";
import Identification from "./Identification";
import Observation from "./Observation";
import Photo from "./Photo";
import Taxon from "./Taxon";
import User from "./User";

export default {
  schema: [
    Comment,
    Identification,
    Observation,
    Photo,
    Taxon,
    User
  ],
  schemaVersion: 2,
  path: "db.realm"
};
