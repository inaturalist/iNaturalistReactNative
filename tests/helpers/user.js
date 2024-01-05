import { API_HOST } from "components/LoginSignUp/AuthenticationService";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import nock from "nock";
import RNSInfo from "react-native-sensitive-info";
import { makeResponse } from "tests/factory";

const TEST_JWT = "test-json-web-token";
const TEST_ACCESS_TOKEN = "test-access-token";

async function signOut( options = {} ) {
  const realm = options.realm || global.realm;
  i18next.language = undefined;
  // This is the nuclear option, maybe revisit if it's a source of bugs
  realm.write( ( ) => {
    realm.deleteAll( );
  } );
  await RNSInfo.deleteItem( "username" );
  await RNSInfo.deleteItem( "jwtToken" );
  await RNSInfo.deleteItem( "jwtGeneratedAt" );
  await RNSInfo.deleteItem( "accessToken" );
}

async function signIn( user, options = {} ) {
  const realm = options.realm || global.realm;
  await RNSInfo.setItem( "username", user.login );
  await RNSInfo.setItem( "jwtToken", TEST_JWT );
  await RNSInfo.setItem( "jwtGeneratedAt", Date.now( ).toString( ), {} );
  await RNSInfo.setItem( "accessToken", TEST_ACCESS_TOKEN );
  inatjs.users.me.mockResolvedValue( makeResponse( [user] ) );
  user.signedIn = true;
  realm.write( ( ) => {
    realm.create( "User", user, "modified" );
  } );
  nock( API_HOST )
    .post( "/oauth/token" )
    .reply( 200, { access_token: TEST_ACCESS_TOKEN } )
    .get( "/users/edit.json" )
    .reply( 200, { login: user.login, id: user.id } );
  nock( API_HOST, {
    reqheaders: {
      authorization: `Bearer ${TEST_ACCESS_TOKEN}`
    }
  } )
    .get( "/users/api_token.json" )
    .reply( 200, { api_token: "some-jwt" } );
}

export {
  signIn,
  signOut,
  TEST_ACCESS_TOKEN,
  TEST_JWT
};
