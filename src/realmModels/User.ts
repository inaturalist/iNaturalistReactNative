import type { ApiUser } from "api/types";
import Realm, { ObjectSchema } from "realm";

import type { RealmUser } from "./types";

class User extends Realm.Object {
  static FIELDS = {
    icon_url: true,
    id: true,
    locale: true,
    login: true,
    name: true,
    observations_count: true,
    prefers_common_names: true,
    prefers_scientific_name_first: true
  };

  static LIMITED_FIELDS = {
    icon_url: true,
    id: true,
    login: true,
    observations_count: true
  };

  // getting user icon data from production instead of staging
  static uri( user?: RealmUser | ApiUser ) {
    const iconUrl = ( user as ApiUser )?.icon_url || ( user as RealmUser )?.iconUrl;
    return iconUrl?.replace( "staticdev", "static" );
  }

  static currentUser( realm: Realm ) {
    return realm.objects( "User" ).filtered( "signedIn == true" )[0];
  }

  static schema: ObjectSchema = {
    name: "User",
    primaryKey: "id",
    properties: {
      id: "int",
      icon_url: {
        type: "string",
        mapTo: "iconUrl",
        optional: true
      },
      locale: "string?",
      login: "string?",
      name: "string?",
      observations_count: "int?",
      prefers_common_names: "bool?",
      prefers_community_taxa: "bool?",
      prefers_scientific_name_first: "bool?",
      signedIn: "bool?"
    }
  };
}

export default User;
