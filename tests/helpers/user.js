// In this case we *do* want manual cleanup because we want to make sure the
// component tree has been taken down before we delete all the content in
// Realm. Otherwise we get after effects from listeners on Realm, Realm
// queries, and Realm objects that are hard/impossible to wait for before
// tests finish
// eslint-disable-next-line testing-library/no-manual-cleanup
import { cleanup } from "@testing-library/react-native";
import { API_HOST, clearAuthCache } from "components/LoginSignUp/AuthenticationService";
import { getInatLocaleFromSystemLocale } from "i18n/initI18next";
import i18next from "i18next";
import inatjs from "inaturalistjs";
import nock from "nock";
import RNSInfo from "react-native-sensitive-info";
import changeLanguage from "sharedHelpers/changeLanguage";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { makeResponse } from "tests/factory";

const TEST_JWT = "test-json-web-token";
const TEST_ACCESS_TOKEN = "test-access-token";

async function signOut( options = {} ) {
  const realm = options.realm || global.realm;
  i18next.language = undefined;
  // As mentioned above, clean up the component tree so we don't have after
  // effects related to deleting all realm objects.
  // Note: if we ever write tests explicitly testing UI sign out, we might
  // want to write an optional exception to this step
  cleanup( );
  // This is the nuclear option, maybe revisit if it's a source of bugs
  safeRealmWrite( realm, ( ) => {
    realm.deleteAll( );
  }, "deleting entire realm in signOut function, user.js" );
  const systemLocale = getInatLocaleFromSystemLocale( );
  changeLanguage( systemLocale );
  await RNSInfo.deleteItem( "username" );
  await RNSInfo.deleteItem( "jwtToken" );
  await RNSInfo.deleteItem( "jwtGeneratedAt" );
  await RNSInfo.deleteItem( "accessToken" );
  clearAuthCache( );
  inatjs.users.me.mockClear( );
}

async function signIn( user, options = {} ) {
  const realm = options.realm || global.realm;
  await RNSInfo.setItem( "username", user.login );
  await RNSInfo.setItem( "jwtToken", TEST_JWT );
  await RNSInfo.setItem( "jwtGeneratedAt", Date.now( ).toString( ), {} );
  await RNSInfo.setItem( "accessToken", TEST_ACCESS_TOKEN );
  clearAuthCache( );
  inatjs.users.me.mockResolvedValue( makeResponse( [user] ) );
  user.signedIn = true;
  safeRealmWrite( realm, ( ) => {
    realm.create( "User", user, "modified" );
  }, "signing user in, user.js" );
  if ( user?.locale ) {
    changeLanguage( user.locale );
  }
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
