// @flow

import Comment from "./Comment";
import Observation from "./Observation";

export default {
  schema: [
    Comment,
    Observation
  ],
  schemaVersion: 1,
  path: "db.realm"
};
