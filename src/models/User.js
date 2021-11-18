class User {
  static createObjectForRealm( user ) {
    return {
      id: user.id,
      iconUrl: user.icon_url,
      login: user.login,
      name: user.name
    };
  }

  static schema = {
    name: "User",
    properties: {
      id: "int",
      iconUrl: "string?",
      login: "string?",
      name: "string?"
    }
  }
}

export default User;
