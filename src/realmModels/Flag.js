import { Realm } from "@realm/react";

// import User from "./User";

class Flag extends Realm.Object {
  static FLAG_FIELDS = {
    id: true,
    comment: true,
    created_at: true,
    flag: true,
    flaggable_content: true,
    flaggable_id: true,
    flaggable_type: true,
    resolved: true,
    // $FlowFixMe
    // user: User && ( { ...User.USER_FIELDS, id: true } ),
    uuid: true
  };

  //   static mimicRealmMappedPropertiesSchema( flags ) {
  //     return {
  //       ...flags,
  //       user: User.mapApiToRealm( flag.user, realm )
  //     };
  //   }

  //   static mapApiToRealm( flag, realm ) {
  //     const newFlag = {
  //       ...flag,
  //       user: User.mapApiToRealm( flag.user, realm )
  //     };
  //     // const newFlag = []
  //     return newFlag;
  //   }

  static mapApiToRealm( flag ) {
    return flag;
  }

  static schema = {
    name: "Flag",
    primaryKey: "uuid",
    properties: {
      created_at: { type: "string?", mapTo: "createdAt" },
      id: "int",
      comment: "string?",
      flag: "string",
      flaggable_content: "string?",
      flaggable_id: "int?",
      flaggable_type: "string?",
      resolved: "bool",
      uuid: "string?"
    //   user: "User?",
    }
  }
}

export default Flag;
