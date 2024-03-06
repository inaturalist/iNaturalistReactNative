import { Realm } from "@realm/react";

class User extends Realm.Object {
  static FIELDS = {
    icon_url: true,
    id: true,
    login: true,
    name: true,
    locale: true,
    observations_count: true,
    prefers_scientific_name_first: true
  };

  // getting user icon data from production instead of staging
  static uri = user => {
    // if user is current user and has cached icon, prioritize this
    if ( user?.cached_icon_url ) {
      return { uri: user.cached_icon_url.replace( "staticdev", "static" ) };
    }
    if ( user?.icon_url ) {
      return { uri: user?.icon_url.replace( "staticdev", "static" ) };
    }
    return null;
  };

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
      prefers_scientific_name_first: "bool?",
      prefers_community_taxa: "bool?",
      cached_icon_url: { type: "string", optional: true }
    }
  };
}

export default User;
