// @flow
import { create } from "apisauce";
import { version } from "../../../package.json";
import Config from "react-native-config";
import SInfo from "react-native-sensitive-info";
import * as RNLocalize from "react-native-localize";

const HOST = "https://www.inaturalist.org";
const API_HOST = "https://api.inaturalist.org/v1";

// User agent being used, when calling the iNat APIs
const USER_AGENT = `iNaturalist/${version} (ReactNative)`;

class AuthenticationService {
  /**
   * Creates base API client for all requests
   */
  static createAPI(): any {
    return create( {
      baseURL: HOST,
      headers: { "User-Agent": USER_AGENT }
    } );
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
  ): Promise<string> {
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
}

export default AuthenticationService;
