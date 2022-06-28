import Realm from "realm";

import User from "./User";
class Comment extends Realm.Object {
  static COMMENT_FIELDS = {
    body: true,
    created_at: true,
    id: true,
    user: User.USER_FIELDS,
    uuid: true
  };

  static mapApiToRealm( comment, realm ) {
    return {
      ...comment,
      user: User.mapApiToRealm( comment.user, realm )
    };
  }

  static schema = {
    name: "Comment",
    properties: {
      uuid: "string",
      body: "string?",
      created_at: { type: "string?", mapTo: "createdAt" },
      id: "int?",
      user: "User?",
      // this creates an inverse relationship so comments
      // automatically keep track of which Observation they are assigned to
      assignee: {
        type: "linkingObjects",
        objectType: "Observation",
        property: "comments"
      }
    }
  }
}

export default Comment;
