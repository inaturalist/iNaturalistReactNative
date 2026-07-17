import type { ApiUser } from "api/types";
import type { ObjectSchema } from "realm";
import Realm from "realm";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

import type { RealmUser } from "./types";

export interface TaxonNamesSettings {
  prefers_common_names: boolean;
  prefers_scientific_name_first: boolean;
}
class User extends Realm.Object {
  static FIELDS = {
    identifications_count: true,
    icon_url: true,
    id: true,
    locale: true,
    login: true,
    name: true,
    observations_count: true,
    prefers_common_names: true,
    prefers_scientific_name_first: true,
  };

  static LIMITED_FIELDS = {
    icon_url: true,
    id: true,
    login: true,
    observations_count: true,
  };

  // getting user icon data from production instead of staging
  static uri( user?: RealmUser | ApiUser ) {
    const iconUrl = ( user as ApiUser )?.icon_url || ( user as RealmUser )?.iconUrl;
    return iconUrl?.replace( "staticdev", "static" );
  }

  static thumbUri( user?: RealmUser | ApiUser ) {
    return User.uri( user )?.replace( "medium", "thumb" );
  }

  static currentUser( realm: Realm ): RealmUser {
    return realm.objects<RealmUser>( "User" ).filtered( "signedIn == true" )[0];
  }

  /**
   * Maps a live Realm User into a plain object
   *
   * @param user - a live Realm User
   * @returns plain user snapshot, or null
   */
  static mapRealmToPojo( user?: RealmUser | null ) {
    if ( !user ) return null;
    return {
      id: user.id,
      identifications_count: user.identifications_count,
      icon_url: user.iconUrl,
      locale: user.locale,
      login: user.login,
      name: user.name,
      observations_count: user.observations_count,
      prefers_common_names: user.prefers_common_names,
      prefers_community_taxa: user.prefers_community_taxa,
      prefers_scientific_name_first: user.prefers_scientific_name_first,
      signedIn: user.signedIn,
    };
  }

  static updatePreferences( realm: Realm, newPreferences: TaxonNamesSettings ) {
    const currentUser = User.currentUser( realm );
    safeRealmWrite( realm, ( ) => {
      currentUser.prefers_common_names = newPreferences.prefers_common_names;
      currentUser.prefers_scientific_name_first = newPreferences.prefers_scientific_name_first;
    }, "updating user preferences" );
  }

  static schema: ObjectSchema = {
    name: "User",
    primaryKey: "id",
    properties: {
      id: "int",
      identifications_count: "int?",
      icon_url: {
        type: "string",
        mapTo: "iconUrl",
        optional: true,
      },
      locale: "string?",
      login: "string?",
      name: "string?",
      observations_count: "int?",
      prefers_common_names: "bool?",
      prefers_community_taxa: "bool?",
      prefers_scientific_name_first: "bool?",
      signedIn: "bool?",
    },
  };
}

export type UserPojo = NonNullable<ReturnType<typeof User.mapRealmToPojo>>;

export default User;
