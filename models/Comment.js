class Comment {
  constructor( comment ) {
    console.log( comment, "comment in realm" );
    this.uuid = comment.uuid;
    this.body = comment.body;
    this.createdAt = comment.created_at;
    this.id = comment.id;
    this.user = comment.user.login;
  }

  static schema = {
    name: "Comment",
    primaryKey: "uuid",
    properties: {
      uuid: "string",
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
