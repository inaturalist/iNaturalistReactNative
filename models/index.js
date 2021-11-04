// @flow

import Comment from "./Comment";
import Identification from "./Identification";
import Observation from "./Observation";
import Photo from "./Photo";

export default {
  schema: [
    Comment,
    Identification,
    Observation,
    Photo
  ],
  schemaVersion: 1,
  path: "db.realm"
};
