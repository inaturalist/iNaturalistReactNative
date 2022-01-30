// @flow
import { create } from "apisauce";
import { version } from "../../../package.json";
import Config from "react-native-config";
import SInfo from "react-native-sensitive-info";
import * as RNLocalize from "react-native-localize";
import RNSInfo from "react-native-sensitive-info";
import { sign } from "react-native-pure-jwt";

const HOST = "https://www.inaturalist.org";
// const API_HOST = "https://api.inaturalist.org/v1";

// User agent being used, when calling the iNat APIs
const USER_AGENT = `iNaturalist/${version} (ReactNative)`;

const JWT_TOKEN_EXPIRATION_MINS = 25; // JWT Tokens expire after 30 mins - consider 25 mins as the max time (safe margin)

class AuthenticationService {
  /**
   * Creates base API client for all requests
   * @param additionalHeaders any additional headers that will be passed to the API
   */
  static createAPI( additionalHeaders: any ): any {
    return create( {
      baseURL: HOST,
      headers: { "User-Agent": USER_AGENT, ...additionalHeaders }
    } );
  }

  /**
   * Returns the API access token to be used with all iNaturalist API calls
   *
   * @param useJWT if true, we'll use JSON Web Token instead of the "regular" access token
   * @param allowAnonymousJWTToken (optional=false) if true and user is not logged-in, use anonymous JWT
   * @returns {Promise<string|*>} access token, null if not logged in
   */
  static async getAPIToken( useJWT: boolean = false,  allowAnonymousJWTToken: boolean = false ): Promise<?string> {
    let isLoggedIn = await this.isLoggedIn();
    if ( !isLoggedIn ) {
      return null;
    }

    if ( useJWT ) {
      return this.getJWTToken( allowAnonymousJWTToken );
    } else {
      const accessToken = await RNSInfo.getItem( "accessToken" );
      return `Bearer ${accessToken}`;
    }
  }

  /**
   * Returns the access token to be used in case of an anonymous JWT (e.g. used when getting taxon suggestions)
   * @returns {Promise<string>}
   */
  static async getAnonymousJWTToken(): string {
    const claims = {
      application: "android",
      exp: Date.now() / 1000 + 300
    };

    const hash = await sign( claims, Config.JWT_ANONYMOUS_API_SECRET, {
      alg: "HS512"
    } );

    return hash;
  }

  /**
   * Returns most recent JWT (JSON Web Token) for API authentication - renews the token if necessary
   *
   * @param allowAnonymousJWTToken (optional=false) if true and user is not logged-in, use anonymous JWT
   * @returns {Promise<string|*>}
   */
  static async getJWTToken( allowAnonymousJWTToken: boolean = false ): Promise<?string> {
    let jwtToken = await RNSInfo.getItem( "jwtToken" );
    let jwtTokenExpiration = await RNSInfo.getItem( "jwtTokenExpiration" );
    if ( jwtTokenExpiration ) {
      jwtTokenExpiration = parseInt( jwtTokenExpiration );
    }

    let isLoggedIn = await this.isLoggedIn();

    if ( !isLoggedIn && allowAnonymousJWTToken ) {
      // User not logged in, and anonymous JWT is allowed - return it
      return this.getAnonymousJWTToken();
    }

    if (
      !jwtToken ||
      ( Date.now() - jwtTokenExpiration ) / 1000 > JWT_TOKEN_EXPIRATION_MINS * 60
    ) {
      // JWT Tokens expire after 30 mins - if the token is non-existent or older than 25 mins (safe margin) - ask for a new one

      const accessToken = await RNSInfo.getItem( "accessToken" );
      const api = this.createAPI( { Authorization: `Bearer ${accessToken}` } );
      const response = await api.get( "/users/api_token.json" );

      if ( !response.ok ) {
        console.error(
          `Error while renewing JWT: ${response.problem} - ${response.status}`
        );
        return null;
      }

      // Get newest JWT Token
      jwtToken = response.data.api_token;
      jwtTokenExpiration = Date.now();

      await SInfo.setItem( "jwtToken", jwtToken );
      await SInfo.setItem( "jwtTokenExpiration", jwtTokenExpiration.toString() );

      return jwtToken;
    } else {
      // Current JWT token is still fresh/valid - return it as-is
      return jwtToken;
    }
  }

  /**
   * Authenticates a user and saves authentication details to secure storage, to be used when calling iNat APIs.
   *
   * @param username
   * @param password
   * @returns false in case of authentication error, true otherwise.
   */
  static async authenticateUser(
    username: string,
    password: string
  ): Promise<boolean> {
    const userDetails = await this.verifyCredentials( username, password );

    if ( !userDetails ) {
      return false;
    }

    // Save authentication details to secure storage
    await SInfo.setItem( "username", userDetails.username, {} );
    await SInfo.setItem( "accessToken", userDetails.accessToken, {} );

    return true;
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
  static async registerUser(
    email: string,
    username: string,
    password: string,
    license: void | string,
    time_zone: void | string
  ): Promise<?string> {
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
    if ( time_zone ) {
      formData.append( "user[time_zone]", time_zone );
    }

    const api = this.createAPI();
    let response = await api.post( "/users.json", formData );

    if ( !response.ok ) {
      console.error(
        "registerUser failed when calling /users.json - ",
        response.problem,
        response.status
      );
      return response.data.errors[0];
    }

    console.info( "registerUser - success" );
    return null;
  }

  /**
   * Verifies login credentials
   *
   * @param username
   * @param password
   * @return null in case of error, otherwise an object of accessToken, username (=iNaturalist username)
   */
  static async verifyCredentials(
    username: string,
    password: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append( "format", "json" );
    formData.append( "grant_type", "password" );
    formData.append( "client_id", Config.OAUTH_CLIENT_ID );
    formData.append( "client_secret", Config.OAUTH_CLIENT_SECRET );
    formData.append( "password", password );
    formData.append( "username", username );

    const api = this.createAPI();
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
    console.log( "verifyCredentials - logged in username ", iNatUsername );

    return {
      accessToken: accessToken,
      username: iNatUsername
    };
  }

  /**
   * Returns whether we're currently logged in.
   *
   * @returns {Promise<boolean>}
   */
  static async isLoggedIn(): Promise<boolean> {
    const accessToken = await RNSInfo.getItem( "accessToken", {} );
    return typeof accessToken === "string";
  }

  /**
   * Returns the logged-in username
   *
   * @returns {Promise<boolean>}
   */
  static async getUsername(): Promise<string> {
    return await RNSInfo.getItem( "username", {} );
  }

  /**
   * Signs out the user
   *
   * @returns {Promise<void>}
   */
  static async signOut() {
    await SInfo.deleteItem( "jwtToken" );
    await SInfo.deleteItem( "jwtTokenExpiration" );
    await SInfo.deleteItem( "username" );
    await SInfo.deleteItem( "accessToken" );
  }
}

export default AuthenticationService;
