import type { QueryClient } from "@tanstack/query-core";
import type { ApiUser } from "api/types";
import { getUserAgent } from "api/userAgent";
import { fetchUserEmailAvailable, fetchUserMe } from "api/users";
import type { ApiResponse, ApisauceInstance } from "apisauce";
import { create } from "apisauce";
import {
  computerVisionPath,
  photoLibraryPhotosPath,
  photoUploadPath,
  rotatedOriginalPhotosPath,
  soundUploadPath,
} from "appConstants/paths";
import { getInatLocaleFromSystemLocale } from "i18n/initI18next";
import i18next from "i18next";
import rs from "jsrsasign";
import { Alert, Platform } from "react-native";
import Config from "react-native-config";
import * as RNLocalize from "react-native-localize";
import RNRestart from "react-native-restart";
import type { SensitiveInfoError } from "react-native-sensitive-info";
import RNSInfo, { ErrorCode, isSensitiveInfoError } from "react-native-sensitive-info";
import Realm, { UpdateMode } from "realm";
import realmConfig from "realmModels/index";
import changeLanguage from "sharedHelpers/changeLanguage";
import { getInstallID } from "sharedHelpers/installData";
import { log, logFilePath, logWithoutRemote } from "sharedHelpers/logger";
import removeAllFilesFromDirectory from "sharedHelpers/removeAllFilesFromDirectory";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { unlink } from "sharedHelpers/util";
import { isDebugMode } from "sharedHooks/useDebugMode";
import zustandMMKVBackingStorage from "stores/zustandMMKVBackingStorage";

const logger = log.extend( "AuthenticationService" );
// The remote transport in the default logger uses many of the methods in this
// module. Using a separate logger that only writes to disk avoids some
// potential for infinite loops.
const localLogger = logWithoutRemote.extend( "AuthenticationService" );

// Base API domain can be overridden (in case we want to use staging URL) -
// either by placing it in .env file, or in an environment variable.
const API_HOST: string = Config.OAUTH_API_URL || process.env.OAUTH_API_URL || "https://www.inaturalist.org";

// JWT Tokens expire after 30 mins - consider 25 mins as the max time
// (safe margin). Actually they expire in 24 hours, but ideally they would
// expire every 30 mins, so might as well be futureproof.
const JWT_EXPIRATION_MINS = 25;

interface AuthCache {
  isLoggedIn: boolean | null;
  lastChecked: number | null;
  cacheTimeout: number;
}

/**
 * Cache for isLoggedIn, to avoid making too many calls to RNSInfo.getItem
 */
const authCache: AuthCache = {
  isLoggedIn: null,
  lastChecked: null,
  cacheTimeout: 5000,
};

/**
 * Clear cache for isLoggedIn.
 */
const clearAuthCache = ( ): void => {
  authCache.isLoggedIn = null;
  authCache.lastChecked = null;
};

async function getSensitiveItem( key: string, options = {} ) {
  const exists = await RNSInfo.hasItem( key, options );
  if ( !exists ) {
    return null;
  }

  try {
    return await RNSInfo.getItem( key, options );
  } catch ( e ) {
    if ( isSensitiveInfoError( e ) ) {
      const getItemError = e as SensitiveInfoError;
      if ( isDebugMode() ) {
        switch ( getItemError.code ) {
          case ErrorCode.NOT_FOUND:
            // Value doesn't exist
            localLogger.info( `RNSInfo.getItem not available for ${key}` );
            break;
          default:
            localLogger.info( `RNSInfo.getItem unknown error for ${key}: ${getItemError.message}` );
            break;
        }
      }
    }
    throw e;
  }
}

async function setSensitiveItem( key: string, value: string, options = {} ) {
  const actualOptions = {
    ...options,
    accessControl: "none" as const,
  };
  try {
    const result = await RNSInfo.setItem( key, value, actualOptions );
    clearAuthCache( );
    return result;
  } catch ( e ) {
    if ( isSensitiveInfoError( e ) ) {
      const setItemError = e as SensitiveInfoError;
      if ( isDebugMode( ) ) {
        localLogger.info(
          `RNSInfo.setItem error for ${key}, ${setItemError.code} ${setItemError.message}`,
        );
      }
    }
    throw e;
  }
}

async function deleteSensitiveItem( key: string, options = {} ) {
  try {
    const result = await RNSInfo.deleteItem( key, options );
    clearAuthCache( );
    return result;
  } catch ( e ) {
    if ( isSensitiveInfoError( e ) ) {
      const deleteItemError = e as SensitiveInfoError;
      if ( isDebugMode() ) {
        localLogger.info(
          `RNSInfo.deleteItem error for ${key}, ${deleteItemError.code} ${deleteItemError.message}`,
        );
      }
    }
    throw e;
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
    "X-Installation-ID": getInstallID( ),
    ...additionalHeaders,
  },
} );

/**
 * Returns whether we're currently logged in.
 *
 * @returns {Promise<boolean>}
 */
const isLoggedIn = async (): Promise<boolean> => {
  const now = Date.now();

  // if cached value is fresh, return it before checking storage
  if (
    authCache.isLoggedIn !== null
    && authCache.lastChecked
    && ( now - authCache.lastChecked ) < authCache.cacheTimeout
  ) {
    return authCache.isLoggedIn;
  }

  try {
    const accessToken = await getSensitiveItem( "accessToken" );
    const result = typeof accessToken === "string";

    authCache.isLoggedIn = result;
    authCache.lastChecked = now;

    return result;
  } catch ( error ) {
    console.warn( "Auth check failed:", error );
    return false;
  }
};

/**
 * Signs out the user
 *
 * @returns {Promise<void>}
 */
const signOut = async (
  options: {
    realm?: Realm;
    clearRealm?: boolean;
    queryClient?: QueryClient;
  } = {
    clearRealm: false,
    queryClient: undefined,
  },
) => {
  // This makes sure also any cookies will be deleted too (MOB-589)
  const apiClient = createAPI();
  // Don't await on this endpoint, to not delay the signout process
  apiClient.get( "/logout" );

  if ( options.clearRealm ) {
    if ( options.realm ) {
      // Delete all the records in the realm db, including the ones accessible
      // through the copy of realm provided by RealmProvider
      options.realm.beginTransaction();
      try {
        options.realm.deleteAll( );
        options.realm.commitTransaction( );
      } catch ( _realmError ) {
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

  // switch the app back to the system locale when a user signs out
  const systemLocale = getInatLocaleFromSystemLocale( );
  changeLanguage( systemLocale );

  await deleteSensitiveItem( "jwtToken" );
  await deleteSensitiveItem( "jwtGeneratedAt" );
  await deleteSensitiveItem( "username" );
  await deleteSensitiveItem( "accessToken" );
  await unlink( logFilePath );
  // clear all directories containing user generated data within Documents Directory
  await removeAllFilesFromDirectory( computerVisionPath );
  await removeAllFilesFromDirectory( photoLibraryPhotosPath );
  await removeAllFilesFromDirectory( photoUploadPath );
  await removeAllFilesFromDirectory( rotatedOriginalPhotosPath );
  await removeAllFilesFromDirectory( soundUploadPath );

  // delete all keys from mmkv
  zustandMMKVBackingStorage.clearAll( );
  RNRestart.restart( );
};

/**
 * Encodes a JWT. Lifted from react-native-jwt-io
 * https://github.com/maxweb4u/react-native-jwt-io/blob/7f926da46ff536dbb531dd8ae7177ab4ff28c43f/src/jwt.js#L21
 */
const encodeJWT = ( payload: object, key: string, algorithm?: string ) => {
  algorithm = typeof algorithm !== "undefined"
    ? algorithm
    : "HS256";
  return rs.jws.JWS.sign(
    algorithm,
    JSON.stringify( { alg: algorithm, typ: "JWT" } ),
    JSON.stringify( payload ),
    key,
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
    exp: Date.now() / 1000 + 300,
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
const getJWT = async (
  allowAnonymousJWT = false,
  logContext: string | null = null,
): Promise<string | null> => {
  let jwtToken: string | null | undefined = await getSensitiveItem( "jwtToken" );
  const storedJwtGeneratedAt = await getSensitiveItem( "jwtGeneratedAt" );
  let jwtGeneratedAt: number | null = null;
  if ( storedJwtGeneratedAt ) {
    jwtGeneratedAt = parseInt( storedJwtGeneratedAt, 10 );
  }

  const loggedIn = await isLoggedIn();

  if ( !loggedIn && allowAnonymousJWT ) {
    // User not logged in, and anonymous JWT is allowed - return it
    if ( logContext ) {
      logger.info( `JWT [${logContext}]: Using anonymous JWT for non-logged-in user` );
    }
    return getAnonymousJWT();
  }

  if ( !loggedIn ) {
    if ( logContext ) {
      logger.info( `JWT [${logContext}]: User not logged in, returning null` );
    }
    return null;
  }

  if (
    !jwtToken
    || ( jwtGeneratedAt && ( Date.now() - jwtGeneratedAt ) / 1000 > JWT_EXPIRATION_MINS * 60 )
  ) {
    // JWT Tokens expire after 30 mins - if the token is non-existent or older
    // than 25 mins (safe margin) - ask for a new one

    const accessToken = await getSensitiveItem( "accessToken" );
    // accessToken should always be a string here, since we're logged in,
    // i.e. in the function call to loggedIn() above we must have found accessToken
    // to not be null at least in the last 5000 ms
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
      logger.error(
        `JWT [${logContext}]: Token refresh failed - status: ${response.status}`,
        `- originalError: ${response.originalError} - problem: ${response.problem}`,
      );
      // this deletes the user JWT and saved login details when a user is not
      // actually signed in anymore for example, if they installed, deleted,
      // and reinstalled the app without logging out
      if ( response.status === 401 ) {
        if ( logContext ) {
          logger.info( `JWT [${logContext}]: User unauthorized, signing out ` );
        }
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

    if ( logContext ) {
      logger.info( `JWT [${logContext}]: Token refreshed successfully` );
    }

    return jwtToken;
  }
  // Current JWT token is still fresh/valid - return it as-is
  return jwtToken;
};

const showErrorAlert = ( errorText: string ) => {
  Alert.alert(
    "",
    errorText,
  );
};

interface RailsApiResponse {
  error_description?: string;
}

interface OauthTokenResponse extends RailsApiResponse {
  access_token?: string;
}

function errorDescriptionFromResponse( response: ApiResponse<OauthTokenResponse> ): string {
  let errorDescription = response.data?.error_description;
  if ( !errorDescription && response.problem === "NETWORK_ERROR" ) {
    errorDescription = i18next.t( "You-need-an-Internet-connection-to-do-that" );
  }
  if ( errorDescription ) return errorDescription;
  logger.error( "Indescribable error response", JSON.stringify( response ) );
  return i18next.t( "Something-went-wrong" );
}

interface UsersEditResponse extends RailsApiResponse {
  id: number;
  login: string;
  name?: string;
}

interface UserDetails {
  accessToken: string;
  username: string;
  userId: number;
}

async function afterVerifyCredentials(
  tokenResponse: ApiResponse<OauthTokenResponse>,
  apiClient: ApisauceInstance,
): Promise<UserDetails | null> {
  if ( !tokenResponse.ok ) {
    showErrorAlert( errorDescriptionFromResponse( tokenResponse ) );
    return null;
  }

  // Upgrade to the access token
  const accessToken = tokenResponse.data?.access_token;
  if ( !accessToken ) throw new Error( "Fetched empty OAuth access token" );

  // Next, find the iNat username (since we currently only have the FB/Google email)
  const usersEditResponse = await apiClient.get<UsersEditResponse>(
    "/users/edit.json",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": getUserAgent( ),
      },
    },
  );

  if ( !usersEditResponse.ok ) {
    showErrorAlert( errorDescriptionFromResponse( usersEditResponse ) );
    if ( usersEditResponse.problem !== "CLIENT_ERROR" ) {
      console.error(
        "verifyCredentials failed when calling /users/edit.json - ",
        usersEditResponse.problem,
        usersEditResponse.status,
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
    userId: iNatID,
  };
}

/**
 * Verifies login credentials
 *
 * @param username
 * @param password
 * @return null in case of error, otherwise an object of accessToken,
 *  username (=iNaturalist username)
 */
async function verifyCredentials(
  username: string,
  password: string,
): Promise<UserDetails | null> {
  const formData = {
    format: "json",
    grant_type: "password",
    client_id: Config.OAUTH_CLIENT_ID,
    client_secret: Config.OAUTH_CLIENT_SECRET,
    password,
    username,
    locale: i18next.language,
  };

  const apiClient = createAPI();

  // This makes sure also any cookies will be deleted too (MOB-589)
  try {
    await apiClient.get( "/logout" );
  } catch ( error ) {
    console.log( "Error logging out:", error.message );
  }

  const tokenResponse = await apiClient.post<OauthTokenResponse>( "/oauth/token", formData );

  return afterVerifyCredentials( tokenResponse, apiClient );
}

async function afterAuthenticateUser( userDetails: UserDetails | null, realm: Realm ) {
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
    api_token: apiToken,
  };
  const remoteUser = await fetchUserMe( { }, options ) as ApiUser;
  const localUser = remoteUser
    ? {
      ...remoteUser,
      signedIn: true,
    }
    : currentUser;

  if ( remoteUser?.locale ) {
    // user locale preference from web should be saved to realm on sign in
    // and we can also update the app language from web
    changeLanguage( remoteUser?.locale );
  }

  safeRealmWrite( realm, ( ) => {
    realm.create( "User", localUser, UpdateMode.Modified );
  }, "saving current user in AuthenticationService" );
  return true;
}

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
  realm: Realm,
): Promise<boolean> => {
  const userDetails = await verifyCredentials( username, password );

  return afterAuthenticateUser( userDetails, realm );
};

async function authenticateUserByAssertion(
  assertionType: "apple" | "google",
  assertion: string,
  realm: Realm,
) {
  const apiClient = createAPI( { Accept: "application/json" } );
  const formData = {
    client_id: Config.OAUTH_CLIENT_ID,
    client_secret: Config.OAUTH_CLIENT_SECRET,
    locale: i18next.language,
    assertion,
    assertion_type: assertionType,
  };
  const tokenResponse = await apiClient.post<OauthTokenResponse>(
    "/oauth/assertion_token",
    formData,
  );
  const userDetails = await afterVerifyCredentials( tokenResponse, apiClient );
  return afterAuthenticateUser( userDetails, realm );
}

interface CreateUserResponse {
  errors?: string[];
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
      locale: locales[0].languageCode,
    },
  };

  const api = createAPI();
  const response = await api.post<CreateUserResponse>( "/users.json", formData );

  if ( !response.ok ) {
    console.error(
      "registerUser failed when calling /users.json - ",
      response.problem,
      response.status,
    );
    return response.data?.errors?.[0];
  }

  return null;
};

const isCurrentUser = async ( username: string ): Promise<boolean> => {
  const currentUsername = await getSensitiveItem( "username" );
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
      email,
    },
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

/**
 * Check if an email is available for registration
 *
 * @param email
 *
 * @returns boolean if email is available or not
 */
const emailAvailable = async ( email: string ) => {
  // try to fetch user data (especially for loading user icon) from userMe
  const apiToken = await getAnonymousJWT( );
  const options = {
    api_token: apiToken,
  };
  const response = await fetchUserEmailAvailable( email, options ) as { available: boolean };
  return response?.available;
};

export {
  API_HOST,
  authenticateUser,
  authenticateUserByAssertion,
  clearAuthCache,
  emailAvailable,
  getAnonymousJWT,
  getJWT,
  isCurrentUser,
  isLoggedIn,
  registerUser,
  resetPassword,
  signOut,
};
