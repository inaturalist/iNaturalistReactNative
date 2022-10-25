// @flow
import { create } from "apisauce";
import { Platform } from "react-native";
import Config from "react-native-config";
import {
  getBuildNumber, getDeviceType, getSystemName, getSystemVersion, getVersion
} from "react-native-device-info";
import jwt from "react-native-jwt-io";
import * as RNLocalize from "react-native-localize";
import RNSInfo from "react-native-sensitive-info";
import Realm from "realm";
// eslint-disable-next-line import/extensions
import realmConfig from "realmModels/index";

// Base API domain can be overridden (in case we want to use staging URL) -
// either by placing it in .env file, or in an environment variable.
const API_HOST: string = Config.OAUTH_API_URL || process.env.OAUTH_API_URL || "https://www.inaturalist.org";

// User agent being used, when calling the iNat APIs
// eslint-disable-next-line max-len
const USER_AGENT = `iNaturalistRN/${getVersion()} ${getDeviceType()} (Build ${getBuildNumber()}) ${getSystemName()}/${getSystemVersion()}`;

// JWT Tokens expire after 30 mins - consider 25 mins as the max time (safe margin)
const JWT_TOKEN_EXPIRATION_MINS = 25;

/**
 * Creates base API client for all requests
 * @param additionalHeaders any additional headers that will be passed to the API
 */
const createAPI = ( additionalHeaders: any ) => create( {
  baseURL: API_HOST,
  headers: { "User-Agent": USER_AGENT, ...additionalHeaders }
} );

/**
 * Returns whether we're currently logged in.
 *
 * @returns {Promise<boolean>}
 */
const isLoggedIn = async (): Promise<boolean> => {
  const accessToken = await RNSInfo.getItem( "accessToken", {} );
  return typeof accessToken === "string";
};

/**
 * Signs out the user
 *
 * @returns {Promise<void>}
 */
const signOut = async (
  options: {
    realm?: Object,
    deleteRealm?: boolean,
    queryClient?: Object
  } = {
    deleteRealm: false,
    queryClient: null
  }
) => {
  if ( options.deleteRealm ) {
    if ( options.realm ) {
      // Delete all the records in the realm db, including the ones accessible
      // through the copy of realm provided by RealmProvider
      options.realm.beginTransaction();
      try {
        // $FlowFixMe
        options.realm.deleteAll( );
        // $FlowFixMe
        options.realm.commitTransaction( );
      } catch ( realmError ) {
        // $FlowFixMe
        options.realm.cancelTransaction( );
        throw realmError;
      }
    }
    Realm.deleteFile( realmConfig );
  }
  // Delete the React Query cache. FWIW, this should *not* be optional, but
  // the checkForSignedInUser needs to call this and that doesn't have access
  // to the React Query context (maybe it could...)
  options.queryClient?.getQueryCache( ).clear( );
  await RNSInfo.deleteItem( "jwtToken", {} );
  await RNSInfo.deleteItem( "jwtTokenExpiration", {} );
  await RNSInfo.deleteItem( "username", {} );
  await RNSInfo.deleteItem( "accessToken", {} );
};

/**
 * Returns the access token to be used in case of an anonymous JWT (e.g. used
 * when getting taxon suggestions)
 * @returns encoded anonymous JWT
 */
const getAnonymousJWTToken = () => {
  const claims = {
    application: Platform.OS,
    exp: Date.now() / 1000 + 300
  };

  return jwt.encode( claims, Config.JWT_ANONYMOUS_API_SECRET, "HS512" );
};

/**
 * Returns most recent JWT (JSON Web Token) for API authentication - renews the token if necessary
 *
 * @param allowAnonymousJWTToken (optional=false) if true and user is not
 *  logged-in, use anonymous JWT
 * @returns {Promise<string|*>}
 */
const getJWTToken = async ( allowAnonymousJWTToken: boolean = false ): Promise<?string> => {
  let jwtToken = await RNSInfo.getItem( "jwtToken", {} );
  let jwtTokenExpiration = await RNSInfo.getItem( "jwtTokenExpiration", {} );
  if ( jwtTokenExpiration ) {
    jwtTokenExpiration = parseInt( jwtTokenExpiration, 10 );
  }

  const loggedIn = await isLoggedIn();

  if ( !loggedIn && allowAnonymousJWTToken ) {
    // User not logged in, and anonymous JWT is allowed - return it
    return getAnonymousJWTToken();
  }

  if ( !loggedIn ) {
    return null;
  }

  if (
    !jwtToken
    || ( Date.now() - jwtTokenExpiration ) / 1000 > JWT_TOKEN_EXPIRATION_MINS * 60
  ) {
    // JWT Tokens expire after 30 mins - if the token is non-existent or older
    // than 25 mins (safe margin) - ask for a new one

    const accessToken = await RNSInfo.getItem( "accessToken", {} );
    const api = createAPI( { Authorization: `Bearer ${accessToken}` } );
    const response = await api.get( "/users/api_token.json" );

    // TODO this means that if the server doesn't respond with a successful
    // token *for any reason* it just deletes the entire local database. That
    // means if you tried to retrieve a new token during downtime, it would
    // delete all of your unsynced observations
    // TODO Also, I (kueda) am not really sure we want to delete all of realm
    // just because auth failed. If you change your password on the website,
    // you should be signed out in the app, BUT if you have unsynced
    // observations shouldn't you have the opportunity to sign in again and
    // upload them?
    if ( !response.ok ) {
      // this deletes the user JWT and saved login details when a user is not
      // actually signed in anymore for example, if they installed, deleted,
      // and reinstalled the app without logging out
      if ( response.status === 401 ) {
        signOut( { deleteRealm: true } );
      }
      console.error(
        `Error while renewing JWT: ${response.problem} - ${response.status}`
      );
      return null;
    }

    // Get newest JWT Token
    jwtToken = response.data.api_token;
    jwtTokenExpiration = Date.now();

    await RNSInfo.setItem( "jwtToken", jwtToken, {} );
    await RNSInfo.setItem( "jwtTokenExpiration", jwtTokenExpiration.toString(), {} );

    return jwtToken;
  }
  // Current JWT token is still fresh/valid - return it as-is
  return jwtToken;
};

/**
 * Returns the API access token to be used with all iNaturalist API calls
 *
 * @param useJWT if true, we'll use JSON Web Token instead of the "regular" access token
 * @param allowAnonymousJWTToken (optional=false) if true and user is not
 *  logged-in, use anonymous JWT
 * @returns {Promise<string|*>} access token, null if not logged in
 */
const getAPIToken = async (
  useJWT: boolean = false,
  allowAnonymousJWTToken: boolean = false
): Promise<?string> => {
  const loggedIn = await isLoggedIn();
  if ( !loggedIn ) {
    return null;
  }

  if ( useJWT ) {
    return getJWTToken( allowAnonymousJWTToken );
  }
  const accessToken = await RNSInfo.getItem( "accessToken", {} );
  return `Bearer ${accessToken}`;
};

/**
 * Verifies login credentials
 *
 * @param username
 * @param password
 * @return null in case of error, otherwise an object of accessToken,
 *  username (=iNaturalist username)
 */
const verifyCredentials = async (
  username: string,
  password: string
) => {
  const formData = new FormData();
  formData.append( "format", "json" );
  formData.append( "grant_type", "password" );
  formData.append( "client_id", Config.OAUTH_CLIENT_ID );
  formData.append( "client_secret", Config.OAUTH_CLIENT_SECRET );
  formData.append( "password", password );
  formData.append( "username", username );

  const api = createAPI();
  let response = await api.post( "/oauth/token", formData );

  if ( !response.ok ) {
    console.error(
      "verifyCredentials failed when calling /oauth/token - ",
      response.problem,
      response.status
    );
    return null;
  }

  // Upgrade to the access token
  const accessToken = response.data.access_token;

  // Next, find the iNat username (since we currently only have the FB/Google email)
  response = await api.get(
    "/users/edit.json",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": USER_AGENT
      }
    }
  );

  if ( !response.ok ) {
    console.error(
      "verifyCredentials failed when calling /users/edit.json - ",
      response.problem,
      response.status
    );

    return null;
  }

  const iNatUsername = response.data.login;
  const iNatID = response.data.id;
  // console.log( "verifyCredentials - logged in username ", iNatUsername );

  return {
    accessToken,
    username: iNatUsername,
    userId: iNatID
  };
};

/**
 * Authenticates a user and saves authentication details to secure storage, to
 * be used when calling iNat APIs.
 *
 * @param username
 * @param password
 * @returns false in case of authentication error, true otherwise.
 */
const authenticateUser = async (
  username: string,
  password: string
): Promise<boolean> => {
  const userDetails = await verifyCredentials( username, password );

  if ( !userDetails ) {
    return false;
  }

  const { userId, username: remoteUsername, accessToken } = userDetails;
  if ( !userId ) {
    return false;
  }

  // Save authentication details to secure storage
  await RNSInfo.setItem( "username", remoteUsername, {} );
  await RNSInfo.setItem( "accessToken", accessToken, {} );
  // await SInfo.setItem( "userId", userId, {} );

  // Save userId to local, encrypted storage
  const currentUser = { id: userId, login: remoteUsername, signedIn: true };
  const realm = await Realm.open( realmConfig );
  realm.write( ( ) => {
    realm?.create( "User", currentUser, "modified" );
  } );

  return true;
};

/**
 * Registers a new user
 *
 * @param email
 * @param username
 * @param password
 * @param license (optional)
 * @param time_zone (optional)
 *
 * @returns null if successful, otherwise an error string
 */
const registerUser = async (
  email: string,
  username: string,
  password: string,
  license: void | string
): any => {
  const formData = new FormData();
  formData.append( "username", username );
  formData.append( "user[email]", email );
  formData.append( "user[login]", username );
  formData.append( "user[password]", password );
  formData.append( "user[password_confirmation]", password );
  // TODO - support for iNat site_id
  if ( license ) {
    formData.append( "user[preferred_observation_license]", license );
    formData.append( "user[preferred_photo_license]", license );
    formData.append( "user[preferred_sound_license]", license );
  }
  const locales = RNLocalize.getLocales();

  formData.append( "user[locale]", locales[0].languageCode );

  const api = createAPI();
  const response = await api.post( "/users.json", formData );

  if ( !response.ok ) {
    console.error(
      "registerUser failed when calling /users.json - ",
      response.problem,
      response.status
    );
    return response.data.errors[0];
  }

  // console.info( "registerUser - success" );
  return null;
};

/**
 * Returns the logged-in username
 *
 * @returns {Promise<boolean>}
 */
const getUsername = async (): Promise<string> => RNSInfo.getItem( "username", {} );

/**
 * Returns the logged-in user
 *
 * @returns {Promise<boolean>}
 */
const getUser = async (): Promise<Object | null> => {
  const realm = await Realm.open( realmConfig );
  return realm.objects( "User" ).filtered( "signedIn == true" )[0];
};

/**
 * Returns the logged-in userId
 *
 * @returns {Promise<boolean>}
 */
const getUserId = async (): Promise<string | null> => {
  const realm = await Realm.open( realmConfig );
  const currentUser = realm.objects( "User" ).filtered( "signedIn == true" )[0];
  const currentUserId = currentUser?.id?.toString( );
  // TODO: still need to figure out the right way/time to close realm but
  // omitting for now bc it interferes with a user being able to save a local
  // observation if they're logged out realm.close( );
  return currentUserId;
};

const isCurrentUser = async ( username: string ): Promise<boolean> => {
  const currentUserLogin = await getUsername( );
  return username === currentUserLogin;
};

export {
  API_HOST,
  authenticateUser,
  getAPIToken,
  getJWTToken,
  getUser,
  getUserId,
  getUsername,
  isCurrentUser,
  isLoggedIn,
  registerUser,
  signOut
};
