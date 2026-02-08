import {
  API_HOST,
  authenticateUser,
  isCurrentUser,
  isLoggedIn,
  registerUser,
  signOut,
} from "components/LoginSignUp/AuthenticationService";
import nock from "nock";
import faker from "tests/helpers/faker";

const USERNAME = "some_user";
const PASSWORD = "123456";
const ACCESS_TOKEN = faker.string.sample( );
const ACCESS_TOKEN_AUTHORIZATION_HEADER = `Bearer ${ACCESS_TOKEN}`;
const JWT = "jwt_token";
const USERID = 113113;

test( "authenticates user", async ( ) => {
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
  await expect( authenticateUser( USERNAME, PASSWORD, global.realm ) ).resolves.toEqual( true );

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
  await expect( authenticateUser( USERNAME, PASSWORD, global.realm ) ).resolves.toEqual( true );

  // Make sure user is logged in
  await expect( isCurrentUser( USERNAME ) ).resolves.toEqual( true );
  await expect( isLoggedIn() ).resolves.toEqual( true );

  // Sign out
  await signOut();
  await expect( isLoggedIn() ).resolves.toEqual( false );

  scope.done();
} );
