class User {
  static mapApiToRealm( user, realm ) {
    const existingUser = realm && realm.objectForPrimaryKey( "User", user.id );
    if ( existingUser ) { return existingUser; }
    return {
      id: user.id,
      iconUrl: user.icon_url,
      login: user.login,
      name: user.name
    };
  }

  static schema = {
    name: "User",
    primaryKey: "id",
    properties: {
      id: "int",
      iconUrl: "string?",
      login: "string?",
      name: "string?"
    }
  }
}

export default User;
