import Realm from "realm";

class User extends Realm.Object {
  static USER_FIELDS = {
    icon_url: true,
    id: true,
    login: true,
    name: true
  };

  static mapApiToRealm( user ) {
    return user;
  }

  static uri = user => ( user && user.icon_url ) && { uri: user.icon_url };

  static userHandle = user => ( user && user.login ) && `@${user.login}`;

  static schema = {
    name: "User",
    primaryKey: "id",
    properties: {
      id: "int",
      icon_url: { type: "string?", mapTo: "iconUrl" },
      login: "string?",
      name: "string?",
      signedIn: "bool?"
    }
  }
}

export default User;
