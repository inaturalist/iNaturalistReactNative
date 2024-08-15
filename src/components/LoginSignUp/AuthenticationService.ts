import type { QueryClient } from "@tanstack/query-core";
import { getUserAgent } from "api/userAgent";
import { fetchUserMe } from "api/users";
import { ApiResponse, create } from "apisauce";
import {
  computerVisionPath,
  galleryPhotosPath,
  photoUploadPath,
  rotatedOriginalPhotosPath,
  soundUploadPath
} from "appConstants/paths.ts";
import i18next from "i18next";
import rs from "jsrsasign";
import { Alert, Platform } from "react-native";
import Config from "react-native-config";
import * as RNLocalize from "react-native-localize";
import RNSInfo from "react-native-sensitive-info";
import Realm, { UpdateMode } from "realm";
import realmConfig from "realmModels/index";
import { log, logFilePath } from "sharedHelpers/logger";
import { installID } from "sharedHelpers/persistedInstallationId.ts";
import removeAllFilesFromDirectory from "sharedHelpers/removeAllFilesFromDirectory.ts";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { sleep, unlink } from "sharedHelpers/util.ts";
import { storage } from "stores/useStore";

const logger = log.extend( "AuthenticationService" );

// Base API domain can be overridden (in case we want to use staging URL) -
// either by placing it in .env file, or in an environment variable.
const API_HOST: string = Config.OAUTH_API_URL || process.env.OAUTH_API_URL || "https://www.inaturalist.org";

// JWT Tokens expire after 30 mins - consider 25 mins as the max time
// (safe margin). Actually they expire in 24 hours, but ideally they would
// expire every 30 mins, so might as well be futureproof.
const JWT_EXPIRATION_MINS = 25;

async function getSensitiveItem( key: string, options = {} ) {
  try {
    return await RNSInfo.getItem( key, options );
  } catch ( e ) {
    const getItemError = e as Error;
    if ( getItemError.message.match( /Protected data not available yet/ ) ) {
      await sleep( 1_000 );
      return RNSInfo.getItem( key, options );
    }
    throw getItemError;
  }
}

async function setSensitiveItem( key: string, value: string, options = {} ) {
  try {
    return await RNSInfo.setItem( key, value, options );
  } catch ( e ) {
    const setItemError = e as Error;
    if ( setItemError.message.match( /Protected data not available yet/ ) ) {
      await sleep( 1_000 );
      return RNSInfo.setItem( key, value, options );
    }
    throw setItemError;
  }
}

async function deleteSensitiveItem( key: string, options = {} ) {
  try {
    return await RNSInfo.deleteItem( key, options );
  } catch ( e ) {
    const deleteItemError = e as Error;
    console.log( "[DEBUG AuthenticationService.js] deleteItemError: ", deleteItemError );
    if ( deleteItemError.message.match( /Protected data not available yet/ ) ) {
      await sleep( 500 );
      return RNSInfo.deleteItem( key, options );
    }
    throw deleteItemError;
  }
}

/**
 * Creates base API client for all requests
 * @param additionalHeaders any additional headers that will be passed to the API
 */
const createAPI = ( additionalHeaders?: { [header: string]: string } ) => create( {
  baseURL: API_HOST,
  headers: {
    "User-Agent": getUserAgent(),
    "X-Installation-ID": installID( ),
    ...additionalHeaders
  }
} );

/**
 * Returns whether we're currently logged in.
 *
 * @returns {Promise<boolean>}
 */
const isLoggedIn = async (): Promise<boolean> => {
  const accessToken = await getSensitiveItem( "accessToken" );
  return typeof accessToken === "string";
};

/**
 * Returns the logged-in username
 *
 * @returns {Promise<boolean>}
 */
const getUsername = async (): Promise<string> => getSensitiveItem( "username" );

/**
 * Signs out the user
 *
 * @returns {Promise<void>}
 */
const signOut = async (
  options: {
    realm?: Realm,
    clearRealm?: boolean,
    queryClient?: QueryClient
  } = {
    clearRealm: false,
    queryClient: undefined
  }
) => {
  if ( options.clearRealm ) {
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
        // If we failed to wipe all the data in realm, delete the realm file.
        // Note that deleting the realm file *all* the time seems to cause
        // problems in Android when the app is force quit, as in sometimes it
        // seems to just delete the file even if you didn't sign out
        Realm.deleteFile( realmConfig );
      }
    }
  }
  // Delete the React Query cache. FWIW, this should *not* be optional, but
  // the checkForSignedInUser needs to call this and that doesn't have access
  // to the React Query context (maybe it could...)
  options.queryClient?.getQueryCache( ).clear( );

  await deleteSensitiveItem( "jwtToken" );
  await deleteSensitiveItem( "jwtGeneratedAt" );
  await deleteSensitiveItem( "username" );
  await deleteSensitiveItem( "accessToken" );
  await unlink( logFilePath );
  // clear all directories containing user generated data within Documents Directory
  await removeAllFilesFromDirectory( computerVisionPath );
  await removeAllFilesFromDirectory( galleryPhotosPath );
  await removeAllFilesFromDirectory( photoUploadPath );
  await removeAllFilesFromDirectory( rotatedOriginalPhotosPath );
  await removeAllFilesFromDirectory( soundUploadPath );
  // delete all keys from mmkv
  storage.clearAll( );
};

/**
 * Encodes a JWT. Lifted from react-native-jwt-io
 * https://github.com/maxweb4u/react-native-jwt-io/blob/7f926da46ff536dbb531dd8ae7177ab4ff28c43f/src/jwt.js#L21
 */
const encodeJWT = ( payload: Object, key: string, algorithm?: string ) => {
  algorithm = typeof algorithm !== "undefined"
    ? algorithm
    : "HS256";
  return rs.jws.JWS.sign(
    algorithm,
    JSON.stringify( { alg: algorithm, typ: "JWT" } ),
    JSON.stringify( payload ),
    key
  );
};

/**
 * Returns the access token to be used in case of an anonymous JWT (e.g. used
 * when getting taxon suggestions)
 * @returns encoded anonymous JWT
 */
const getAnonymousJWT = (): string => {
  const claims = {
    application: Platform.OS,
    exp: Date.now() / 1000 + 300
  };

  return encodeJWT( claims, Config.JWT_ANONYMOUS_API_SECRET || "not-a-real-secret", "HS512" );
};

/**
 * Returns most recent JWT (JSON Web Token) for API authentication - renews the token if necessary
 *
 * @param allowAnonymousJWT (optional=false) if true and user is not
 *  logged-in, use anonymous JWT
 * @returns {Promise<string|*>}
 */
// $FlowIgnore
const getJWT = async ( allowAnonymousJWT = false ): Promise<string | null> => {
  let jwtToken: string | undefined = await getSensitiveItem( "jwtToken" );
  const storedJwtGeneratedAt = await getSensitiveItem( "jwtGeneratedAt" );
  let jwtGeneratedAt: number | null = null;
  if ( storedJwtGeneratedAt ) {
    jwtGeneratedAt = parseInt( storedJwtGeneratedAt, 10 );
  }

  const loggedIn = await isLoggedIn();

  if ( !loggedIn && allowAnonymousJWT ) {
    // User not logged in, and anonymous JWT is allowed - return it
    return getAnonymousJWT();
  }

  if ( !loggedIn ) {
    return null;
  }

  if (
    !jwtToken
    || ( jwtGeneratedAt && ( Date.now() - jwtGeneratedAt ) / 1000 > JWT_EXPIRATION_MINS * 60 )
  ) {
    // JWT Tokens expire after 30 mins - if the token is non-existent or older
    // than 25 mins (safe margin) - ask for a new one

    const accessToken = await getSensitiveItem( "accessToken" );
    const api = createAPI( { Authorization: `Bearer ${accessToken}` } );
    let response;
    try {
      response = await api.get<{api_token: string}>( "/users/api_token.json" );
    } catch ( getUsersApiTokenError ) {
      logger.error( "Failed to fetch JWT: ", getUsersApiTokenError );
      if ( !getUsersApiTokenError ) { return null; }
      throw getUsersApiTokenError;
    }

    // TODO: this means that if the server doesn't respond with a successful
    // token *for any reason* it just deletes the entire local database. That
    // means if you tried to retrieve a new token during downtime, it would
    // delete all of your unsynced observations
    // TODO: Also, I (kueda) am not really sure we want to delete all of realm
    // just because auth failed. If you change your password on the website,
    // you should be signed out in the app, BUT if you have unsynced
    // observations shouldn't you have the opportunity to sign in again and
    // upload them?
    if ( !response.ok ) {
      // this deletes the user JWT and saved login details when a user is not
      // actually signed in anymore for example, if they installed, deleted,
      // and reinstalled the app without logging out
      if ( response.status === 401 ) {
        signOut( { clearRealm: true } );
      }
      return null;
    }

    // Get newest JWT Token
    jwtToken = response.data?.api_token;
    if ( !jwtToken ) {
      throw new Error( "Fetched empty JWT" );
    }
    jwtGeneratedAt = Date.now();

    await setSensitiveItem( "jwtToken", jwtToken );
    await setSensitiveItem( "jwtGeneratedAt", jwtGeneratedAt.toString() );

    return jwtToken;
  }
  // Current JWT token is still fresh/valid - return it as-is
  return jwtToken;
};

/**
 * Returns the API access token to be used with all iNaturalist API calls
 *
 * @param useJWT if true, we'll use JSON Web Token instead of the "regular" access token
 * @param allowAnonymousJWT (optional=false) if true and user is not
 *  logged-in, use anonymous JWT
 * @returns {Promise<string|*>} access token, null if not logged in
 */
const getAPIToken = async (
  // $FlowIgnore
  useJWT = false,
  // $FlowIgnore
  allowAnonymousJWT = false
): Promise<string | null> => {
  const loggedIn = await isLoggedIn();
  if ( !loggedIn ) {
    return null;
  }

  if ( useJWT ) {
    return getJWT( allowAnonymousJWT );
  }
  const accessToken = await getSensitiveItem( "accessToken" );
  return `Bearer ${accessToken}`;
};

const showErrorAlert = ( errorText: string ) => {
  Alert.alert(
    "",
    errorText
  );
};

interface RailsApiResponse {
  error_description?: string;
}

interface OauthTokenResponse extends RailsApiResponse {
  access_token?: string;
}

function errorDescriptionFromResponse( response: ApiResponse<OauthTokenResponse> ): string {
  let errorDescription = response?.data?.error_description;
  if ( !errorDescription && response.problem === "NETWORK_ERROR" ) {
    errorDescription = i18next.t( "You-need-an-Internet-connection-to-do-that" );
  }
  return errorDescription || i18next.t( "Something-went-wrong" );
}

interface UsersEditResponse extends RailsApiResponse {
  id: number;
  login: string;
  name?: string;
}

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
  const formData = {
    format: "json",
    grant_type: "password",
    client_id: Config.OAUTH_CLIENT_ID,
    client_secret: Config.OAUTH_CLIENT_SECRET,
    password,
    username,
    locale: i18next.language
  };

  const api = createAPI();

  const tokenResponse = await api.post<OauthTokenResponse>( "/oauth/token", formData );

  if ( !tokenResponse.ok ) {
    showErrorAlert( errorDescriptionFromResponse( tokenResponse ) );

    if ( tokenResponse.problem !== "CLIENT_ERROR" ) {
      console.error(
        "verifyCredentials failed when calling /oauth/token - ",
        tokenResponse.problem,
        tokenResponse.status
      );
    }
    return null;
  }

  // Upgrade to the access token
  const accessToken = tokenResponse.data?.access_token;
  if ( !accessToken ) throw new Error( "Fetched empty OAuth access token" );

  // Next, find the iNat username (since we currently only have the FB/Google email)
  const usersEditResponse = await api.get<UsersEditResponse>(
    "/users/edit.json",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": getUserAgent( )
      }
    }
  );

  if ( !usersEditResponse.ok ) {
    showErrorAlert( errorDescriptionFromResponse( usersEditResponse ) );
    if ( usersEditResponse.problem !== "CLIENT_ERROR" ) {
      console.error(
        "verifyCredentials failed when calling /users/edit.json - ",
        usersEditResponse.problem,
        usersEditResponse.status
      );
    }

    return null;
  }

  const iNatUsername = usersEditResponse.data?.login;
  const iNatID = usersEditResponse.data?.id;

  if ( !iNatUsername ) throw new Error( "Fetch user without a login" );
  if ( !iNatID ) throw new Error( "Fetch user without an id" );

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
  password: string,
  realm: Realm
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
  await setSensitiveItem( "username", remoteUsername );
  await setSensitiveItem( "accessToken", accessToken );

  // Save userId to local, encrypted storage
  const currentUser = { id: userId, login: remoteUsername, signedIn: true };

  // try to fetch user data (especially for loading user icon) from userMe
  const apiToken = await getJWT( );
  const options = {
    api_token: apiToken
  };
  const remoteUser = await fetchUserMe( { }, options );
  const localUser = remoteUser
    ? {
      ...remoteUser,
      signedIn: true
    }
    : currentUser;

  safeRealmWrite( realm, ( ) => {
    realm.create( "User", localUser, UpdateMode.Modified );
  }, "saving current user in AuthenticationService" );
  return true;
};

interface CreateUserResponse {
  errors?: string[]
}

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
const registerUser = async ( user: { password: string } ) => {
  const locales = RNLocalize.getLocales();
  const formData = {
    user: {
      ...user,
      password_confirmation: user.password,
      locale: locales[0].languageCode
    }
  };

  const api = createAPI();
  const response = await api.post<CreateUserResponse>( "/users.json", formData );

  if ( !response.ok ) {
    console.error(
      "registerUser failed when calling /users.json - ",
      response.problem,
      response.status
    );
    return response.data?.errors?.[0];
  }

  return null;
};

const isCurrentUser = async ( username: string ): Promise<boolean> => {
  const currentUsername = await getUsername( );
  return username === currentUsername;
};

interface ChangePasswordResponse {
  error?: string;
}

/**
 * Resets user password
 *
 * @param email
 *
 * @returns null if successful, otherwise an error string
 */
const resetPassword = async ( email: string ) => {
  const formData = {
    user: {
      email
    }
  };

  const api = createAPI( );
  const response = await api.post<ChangePasswordResponse>( "/users/password", formData );

  // this endpoint doesn't exactly exist,
  // so it's expected to get a 404 Not found error back here
  if ( !response.ok ) {
    return response.data?.error;
  }

  return null;
};

export {
  API_HOST,
  authenticateUser,
  getAnonymousJWT,
  getAPIToken,
  getJWT,
  getUsername,
  isCurrentUser,
  isLoggedIn,
  registerUser,
  resetPassword,
  signOut
};
