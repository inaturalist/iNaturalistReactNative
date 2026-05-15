import {
  API_HOST,
  authenticateUser,
  clearAuthCache,
  getJWT,
  isCurrentUser,
  isLoggedIn,
  registerUser,
  signOut,
} from "components/LoginSignUp/AuthenticationService";
import inatjs from "inaturalistjs";
import { navigationRef } from "navigation/navigationUtils";
import nock from "nock";
import RNSInfo from "react-native-sensitive-info";
import factory, { makeResponse } from "tests/factory";
import faker from "tests/helpers/faker";

jest.mock( "navigation/navigationUtils", ( ) => ( {
  navigationRef: {
    isReady: jest.fn( ),
    navigate: jest.fn( ),
  },
} ) );

const USERNAME = "some_user";
const PASSWORD = "123456";
const ACCESS_TOKEN = faker.string.sample( );
const ACCESS_TOKEN_AUTHORIZATION_HEADER = `Bearer ${ACCESS_TOKEN}`;
const JWT = "jwt_token";
const USERID = 113113;

const mockUserWithUploadedObs = factory( "RemoteUser", {
  id: USERID,
  login: USERNAME,
  observations_count: 5,
} );

const mockUserWithoutUploadedObs = factory( "RemoteUser", {
  id: USERID,
  login: USERNAME,
  observations_count: 0,
} );

test( "authenticates user", async ( ) => {
  inatjs.users.me.mockResolvedValue( makeResponse( [mockUserWithUploadedObs] ) );

  const scope = nock( API_HOST )
    .post( "/oauth/token" )
    .reply( 200, { access_token: ACCESS_TOKEN } )
    .get( "/users/edit.json" )
    .reply( 200, { login: USERNAME, id: USERID } );

  const scope2 = nock( API_HOST, {
    reqheaders: {
      authorization: ACCESS_TOKEN_AUTHORIZATION_HEADER,
    },
  } )
    .get( "/users/api_token.json" )
    .reply( 200, { api_token: JWT } );

  // Authenticate the user
  await expect( isLoggedIn() ).resolves.toEqual( false );
  await expect( authenticateUser( USERNAME, PASSWORD, global.realm ) ).resolves.toEqual( {
    success: true,
    observationsCount: 5,
  } );

  // Make sure user is logged in
  await expect( isCurrentUser( USERNAME ) ).resolves.toEqual( true );
  await expect( isLoggedIn() ).resolves.toEqual( true );

  // Sign out
  await signOut();
  await expect( isLoggedIn() ).resolves.toEqual( false );

  scope.done();
  scope2.done();
} );

test( "registers user", async ( ) => {
  inatjs.users.me.mockResolvedValue( makeResponse( [mockUserWithoutUploadedObs] ) );

  const scope = nock( API_HOST )
    .post( "/oauth/token" )
    .reply( 200, { access_token: ACCESS_TOKEN } )
    .get( "/users/edit.json" )
    .reply( 200, { login: USERNAME, id: USERID } )
    .post( "/users.json" )
    .reply( 200 );

  // Register the user
  await expect( isLoggedIn() ).resolves.toEqual( false );
  await expect( registerUser( "some@mail.com", USERNAME, PASSWORD ) ).resolves.toBeNull( );

  // Log back in
  await expect( authenticateUser( USERNAME, PASSWORD, global.realm ) ).resolves.toEqual( {
    success: true,
    observationsCount: 0,
  } );

  // Make sure user is logged in
  await expect( isCurrentUser( USERNAME ) ).resolves.toEqual( true );
  await expect( isLoggedIn() ).resolves.toEqual( true );

  // Sign out
  await signOut();
  await expect( isLoggedIn() ).resolves.toEqual( false );

  scope.done();
} );

describe( "getJWT 401 handling", ( ) => {
  beforeEach( ( ) => {
    // Reset the isLoggedIn cache — previous tests (e.g. "authenticates user") may
    // have cached isLoggedIn=false after signOut, which would short-circuit getJWT.
    clearAuthCache( );

    // Seed a valid accessToken so isLoggedIn() returns true and triggers JWT refresh
    const service = new Map( );
    service.set( "accessToken", "test-access-token" );
    RNSInfo.stores.set( "app", service );

    navigationRef.isReady.mockReturnValue( true );
    navigationRef.navigate.mockClear( );
    // deleteItem is already a jest.fn() in the mock — clear its call history directly
    RNSInfo.deleteItem.mockClear( );
  } );

  afterEach( ( ) => {
    RNSInfo.stores.clear( );
    nock.cleanAll( );
  } );

  it( "does not call signOut on 401", async ( ) => {
    nock( API_HOST )
      .get( "/users/api_token.json" )
      .reply( 401 );

    await getJWT( );

    // signOut deletes "username" from storage; the 401 path should not
    const deletedKeys = RNSInfo.deleteItem.mock.calls.map( ( [key] ) => key );
    expect( deletedKeys ).not.toContain( "username" );
  } );

  it( "navigates to LoginStackNavigator on 401 when navigationRef is ready", async ( ) => {
    nock( API_HOST )
      .get( "/users/api_token.json" )
      .reply( 401 );

    await getJWT( );

    expect( navigationRef.navigate ).toHaveBeenCalledWith(
      "LoginStackNavigator",
      { screen: "Login" },
    );
  } );

  it( "does not navigate when navigationRef is not ready", async ( ) => {
    navigationRef.isReady.mockReturnValue( false );

    nock( API_HOST )
      .get( "/users/api_token.json" )
      .reply( 401 );

    await getJWT( );

    expect( navigationRef.navigate ).not.toHaveBeenCalled( );
  } );

  it( "navigates on each 401 response", async ( ) => {
    // React Navigation's navigate() handles duplicate destinations gracefully,
    // so multiple 401 responses navigating to LoginStackNavigator is acceptable.
    nock( API_HOST )
      .get( "/users/api_token.json" )
      .reply( 401 );

    await getJWT( );

    expect( navigationRef.navigate ).toHaveBeenCalledWith(
      "LoginStackNavigator",
      { screen: "Login" },
    );
  } );

  it( "returns null on 401", async ( ) => {
    nock( API_HOST )
      .get( "/users/api_token.json" )
      .reply( 401 );

    const result = await getJWT( );

    expect( result ).toBeNull( );
  } );
} );
