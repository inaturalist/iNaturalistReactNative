import Realm, { ObjectSchema } from "realm";

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

  // getting user icon data from production instead of staging
  static uri( user: { icon_url?: string } ) {
    return user?.icon_url
      && { uri: user?.icon_url.replace( "staticdev", "static" ) };
  }

  static userHandle( user: { login: string } ) {
    return user && `@${user.login}`;
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
