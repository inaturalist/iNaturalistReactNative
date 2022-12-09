import inatjs from "inaturalistjs";
import RNSInfo from "react-native-sensitive-info";

import { makeResponse } from "../factory";

async function signInUser( user ) {
  await RNSInfo.setItem( "username", user.login );
  await RNSInfo.setItem( "jwtToken", "yaddayadda" );
  await RNSInfo.setItem( "jwtTokenExpiration", Date.now( ).toString( ), {} );
  await RNSInfo.setItem( "accessToken", "yaddayadda" );
  inatjs.users.me.mockResolvedValue( makeResponse( [user] ) );
  user.signedIn = true;
  global.realm.write( ( ) => {
    // global.realm.create( "User", { ...user, signedIn: true }, "modified" );
    global.realm.create( "User", user, "modified" );
  } );
}

export {
  // Pretty sure we'll be adding more here...
  // eslint-disable-next-line import/prefer-default-export
  signInUser
};
