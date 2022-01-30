import nock from "nock";
import AuthenticationService from "../../../../src/components/LoginSignUp/AuthenticationService";

const USERNAME = "some_user";
const PASSWORD = "123456";
const ACCESS_TOKEN = "some_token";
const ACCESS_TOKEN_AUTHORIZATION_HEADER = `Bearer ${ACCESS_TOKEN}`;
const JWT = "jwt_token";

// Make apisauce work with nock
jest.mock( "apisauce", ( ) => ( {
  create: ( config ) => {
    let axiosInstance = jest.requireActual( "axios" ).create( config );
    const apisauce = jest.requireActual( "apisauce" );
    return apisauce.create( { ...config, axiosInstance } );
  }
} ) );

// FormData isn't available in the testing environment
function FormDataMock() {
  this.append = jest.fn();
}
global.FormData = FormDataMock;

test( "authenticates user", async ( ) => {
  const scope = nock( "https://www.inaturalist.org" )
    .post( "/oauth/token" )
    .reply( 200, { access_token: ACCESS_TOKEN } )
    .get( "/users/edit.json" )
    .reply( 200, { login: USERNAME } );

  const scope2 = nock( "https://www.inaturalist.org" , {
    reqheaders: {
      authorization: ACCESS_TOKEN_AUTHORIZATION_HEADER
    }} )
    .get( "/users/api_token.json" )
    .reply( 200, { api_token: JWT } );

  // Authenticate the user
  await expect( AuthenticationService.isLoggedIn() ).resolves.toEqual( false );
  await expect( AuthenticationService.authenticateUser( USERNAME, PASSWORD ) ).resolves.toEqual( true );
  // Make sure user is logged in
  await expect( AuthenticationService.getUsername() ).resolves.toEqual( USERNAME );
  await expect( AuthenticationService.isLoggedIn() ).resolves.toEqual( true );

  // Make sure access token is returned correctly in all different cases (with/without JWT)
  await expect( AuthenticationService.getAPIToken( false ) ).resolves.toEqual( ACCESS_TOKEN_AUTHORIZATION_HEADER );
  await expect( AuthenticationService.getAPIToken( true ) ).resolves.toEqual( JWT );

  // Sign out
  await AuthenticationService.signOut();
  await expect( AuthenticationService.isLoggedIn() ).resolves.toEqual( false );
  await expect( AuthenticationService.getAPIToken() ).resolves.toBeNull();

  scope.done();
  scope2.done();
} );


test( "registers user", async ( ) => {
  const scope = nock( "https://www.inaturalist.org" )
    .post( "/oauth/token" )
    .reply( 200, { access_token: ACCESS_TOKEN } )
    .get( "/users/edit.json" )
    .reply( 200, { login: USERNAME } )
    .post( "/users.json" )
    .reply( 200 );

  // Register the user
  await expect( AuthenticationService.isLoggedIn() ).resolves.toEqual( false );
  await expect( AuthenticationService.registerUser( "some@mail.com", USERNAME, PASSWORD ) ).resolves.toBeNull( );

  // Log back in
  await expect( AuthenticationService.authenticateUser( USERNAME, PASSWORD ) ).resolves.toEqual( true );

  // Make sure user is logged in
  await expect( AuthenticationService.getUsername() ).resolves.toEqual( USERNAME );
  await expect( AuthenticationService.isLoggedIn() ).resolves.toEqual( true );
  await expect( AuthenticationService.getAPIToken( false ) ).resolves.toEqual( ACCESS_TOKEN_AUTHORIZATION_HEADER );

  // Sign out
  await AuthenticationService.signOut();
  await expect( AuthenticationService.isLoggedIn() ).resolves.toEqual( false );
  await expect( AuthenticationService.getAPIToken() ).resolves.toBeNull();

  scope.done();
} );
