class Comment {
  static createObjectForRealm( id ) {
    return {
      body: id.body,
      createdAt: id.created_at,
      id: id.id,
      user: id.user.login
    };
  }

  static schema = {
    name: "Comment",
    properties: {
      body: "string",
      createdAt: "string",
      id: "int",
      user: "string",
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
