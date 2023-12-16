import { Realm } from "@realm/react";

class User extends Realm.Object {
  static USER_FIELDS = {
    icon_url: true,
    id: true,
    login: true,
    name: true,
    locale: true,
    observations_count: true,
    prefers_scientific_name_first: true
  };

  // getting user icon data from production instead of staging
  static uri = user => user?.icon_url
               && { uri: user?.icon_url.replace( "staticdev", "static" ) };

  static userHandle = user => ( user && user.login ) && `@${user.login}`;

  static currentUser = realm => realm.objects( "User" ).filtered( "signedIn == true" )[0];

  static schema = {
    name: "User",
    primaryKey: "id",
    properties: {
      id: "int",
      icon_url: { type: "string", mapTo: "iconUrl", optional: true },
      login: "string?",
      name: "string?",
      signedIn: "bool?",
      locale: "string?",
      observations_count: "int?",
      prefers_scientific_name_first: "bool?"
    }
  };
}

export default User;
