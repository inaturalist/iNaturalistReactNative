import type { ObjectSchema } from "realm";
import Realm from "realm";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

export interface TaxonNamesSettings {
  prefers_common_names: boolean;
  prefers_scientific_name_first: boolean;
}

export interface UserPojo {
  id: number;
  identifications_count?: number;
  icon_url?: string;
  locale?: string;
  login?: string;
  name?: string;
  observations_count?: number;
  prefers_common_names?: boolean;
  prefers_community_taxa?: boolean;
  prefers_scientific_name_first?: boolean;
  roles: string[];
  signedIn?: boolean;
}

// eslint-disable-next-line no-use-before-define
class User extends Realm.Object<User> {
  // Unset optional properties read back as null, not undefined
  declare id: number;

  declare identifications_count: number | null;

  declare icon_url: string | null;

  declare locale: string | null;

  declare login: string | null;

  declare name: string | null;

  declare observations_count: number | null;

  declare prefers_common_names: boolean | null;

  declare prefers_community_taxa: boolean | null;

  declare prefers_scientific_name_first: boolean | null;

  declare roles: Realm.List<string>;

  declare signedIn: boolean | null;

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
  static uri( user?: { icon_url?: string | null } ) {
    const iconUrl = user?.icon_url;
    return iconUrl?.replace( "staticdev", "static" );
  }

  static thumbUri( user?: { icon_url?: string | null } ) {
    return User.uri( user )?.replace( "medium", "thumb" );
  }

  static currentUser( realm: Realm ): User | undefined {
    return realm.objects( User ).filtered( "signedIn == true" )[0];
  }

  /**
   * Maps a live Realm User into a plain object
   *
   * @param user - a live Realm User
   * @returns plain user snapshot, or null. Unset fields are undefined rather than null so
   * consumers' default props and `?:` types apply
   */
  static mapRealmToPojo( user?: User | null ): UserPojo | null {
    if ( !user ) return null;
    return {
      id: user.id,
      identifications_count: user.identifications_count ?? undefined,
      icon_url: user.icon_url ?? undefined,
      locale: user.locale ?? undefined,
      login: user.login ?? undefined,
      name: user.name ?? undefined,
      observations_count: user.observations_count ?? undefined,
      prefers_common_names: user.prefers_common_names ?? undefined,
      prefers_community_taxa: user.prefers_community_taxa ?? undefined,
      prefers_scientific_name_first: user.prefers_scientific_name_first ?? undefined,
      roles: Array.from( user.roles || [] ),
      signedIn: user.signedIn ?? undefined,
    };
  }

  static updatePreferences( realm: Realm, newPreferences: TaxonNamesSettings ) {
    const currentUser = User.currentUser( realm );
    if ( !currentUser ) return;
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
      roles: "string[]",
      signedIn: "bool?",
    },
  };
}

export default User;
