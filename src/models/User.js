class User {
  static mapApiToRealm( user, realm ) {
    const existingUser = realm && realm.objectForPrimaryKey( "User", user.id );
    if ( existingUser ) { return existingUser; }
    return {
      id: user.id,
      icon_url: user.icon_url,
      login: user.login,
      name: user.name
    };
  }

  static uri = user => ( user && user.icon_url ) && { uri: user.icon_url };

  static userHandle = user => `@${user.login}`;

  static schema = {
    name: "User",
    primaryKey: "id",
    properties: {
      id: "int",
      icon_url: { type: "string?", mapTo: "iconUrl" },
      login: "string?",
      name: "string?"
    }
  }
}

export default User;
