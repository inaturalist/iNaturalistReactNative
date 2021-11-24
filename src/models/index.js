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
  schemaVersion: 2,
  path: "db.realm"
};
