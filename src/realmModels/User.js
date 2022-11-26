import { Realm } from "@realm/react";

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

  // getting user icon data from production instead of staging
  static uri = user => ( user && user.icon_url )
               && { uri: user.icon_url.replace( "staticdev", "static" ) };

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
