import User from "./User";

class Message {
  static mimicRealmMappedPropertiesSchema( msg ) {

    const fromUser = User.mapApiToRealm( msg.from_user );
    const toUser = User.mapApiToRealm( msg.to_user );

    return {
      ...msg,
      subject: msg.subject,
      body: msg.body,
      fromUser,
      toUser,
      threadId: msg.thread_id
    };
  }

  static createMessageForRealm( msg, realm ) {
    const newMsg = {
      ...msg,
        subject: msg.subject,
        body: msg.body,
        fromUser: User.mapApiToRealm( msg.from_user, realm ),
        toUser: User.mapApiToRealm( msg.to_user, realm ),
        threadId: msg.thread_id
    };
    return newMsg;
  }


  //Q: V2 (https://api.inaturalist.org/v2/docs/#/Messages/get_messages) doesn't specify optionality - how should we handle?
  static schema = {
    name: "Message",
    primaryKey: "id",
    properties: {
      id: "string",
      subject: "string?",
      body: "string?",
      from_user: "User?",
      to_user: "User?",
      thread_id: "string?"
    }
  }
}

export default Message;
