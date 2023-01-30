import i18next from "i18next";
import inatjs from "inaturalistjs";
import RNSInfo from "react-native-sensitive-info";

import { makeResponse } from "../factory";

async function signOut( ) {
  i18next.language = undefined;
  // This is the nuclear option, maybe revisit if it's a source of bugs
  global.realm.write( ( ) => {
    global.realm.deleteAll( );
  } );
  await RNSInfo.deleteItem( "username" );
  await RNSInfo.deleteItem( "jwtToken" );
  await RNSInfo.deleteItem( "jwtGeneratedAt" );
  await RNSInfo.deleteItem( "accessToken" );
}

async function signIn( user ) {
  await RNSInfo.setItem( "username", user.login );
  await RNSInfo.setItem( "jwtToken", "yaddayadda" );
  await RNSInfo.setItem( "jwtGeneratedAt", Date.now( ).toString( ), {} );
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
