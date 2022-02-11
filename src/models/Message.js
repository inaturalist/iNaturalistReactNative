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

    // need to append user after the observation realm object has been created
    //delete newObs.user; //Q: Why do we need to do this?
    return newMsg;
  }


  //Q: https://api.inaturalist.org/v1/docs/#!/Messages/get_messages shows everything is optional - how do we handle?
  static schema = {
    name: "Message",
    primaryKey: "uuid", //Q: UUID is used instead of ID - is that right?
    properties: {
      uuid: "string",
      subject: "string",
      body: "string",
      from_user: "User?",
      to_user: "User?",
      thread_id: "string?" //Q: Thread should be integer according to the model, but do we use strings?
    }
  }
}

export default Message;
