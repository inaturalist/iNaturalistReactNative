import { Realm } from "@realm/react";

class Vote extends Realm.Object {
  static VOTE_FIELDS = {
    id: true,
    created_at: true,
    user_id: true,
    vote_flag: true,
    vote_scope: true
  };

  static mapApiToRealm( vote ) {
    return vote;
  }

  static schema = {
    name: "Vote",
    primaryKey: "id",
    properties: {
      created_at: { type: "string", optional: true, mapTo: "createdAt" },
      id: "int",
      user_id: "int",
      vote_flag: "bool",
      vote_scope: "string?"
    }
  };
}

export default Vote;
