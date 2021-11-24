import User from "./User";
class Comment {
  static mapApiToRealm( comment, realm ) {
    return {
      body: comment.body,
      createdAt: comment.created_at,
      id: comment.id,
      user: User.mapApiToRealm( comment.user, realm )
    };
  }

  static schema = {
    name: "Comment",
    properties: {
      body: "string?",
      createdAt: "string?",
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
