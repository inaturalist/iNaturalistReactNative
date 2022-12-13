import inatjs from "inaturalistjs";
import RNSInfo from "react-native-sensitive-info";

import { makeResponse } from "../factory";

async function signOut( ) {
  // This is the nuclear option, maybe revisit if it's a source of bugs
  global.realm.write( ( ) => {
    global.realm.deleteAll( );
  } );
  await RNSInfo.deleteItem( "username" );
  await RNSInfo.deleteItem( "jwtToken" );
  await RNSInfo.deleteItem( "jwtTokenExpiration" );
  await RNSInfo.deleteItem( "accessToken" );
}

async function signIn( user ) {
  await RNSInfo.setItem( "username", user.login );
  await RNSInfo.setItem( "jwtToken", "yaddayadda" );
  await RNSInfo.setItem( "jwtTokenExpiration", Date.now( ).toString( ), {} );
  await RNSInfo.setItem( "accessToken", "yaddayadda" );
  inatjs.users.me.mockResolvedValue( makeResponse( [user] ) );
  user.signedIn = true;
  global.realm.write( ( ) => {
    global.realm.create( "User", user, "modified" );
  } );
}

export {
  signIn,
  signOut
};
