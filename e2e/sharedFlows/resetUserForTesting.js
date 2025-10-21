import { create } from "apisauce";
import inatjs from "inaturalistjs";
import Config from "react-native-config-node";
import * as uuid from "uuid";

const apiHost = Config.OAUTH_API_URL;

const testUsernameAllowlist = [
  "inaturalist-test"
];

const userAgent = "iNaturalistRN/e2e";
const installId = uuid.v4( ).toString( );

inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL,
  userAgent,
  headers: {
    "X-Installation-ID": installId
  }
} );

// programatically dismisses announcements for user and deletes all existing observations
// in order to set up consistent testing conditions and remove need to wait for announcements
export default async function resetUserForTesting() {
  console.log(
    "Test user reset: dismissing announcements and deleting observations..."
  );

  if ( !testUsernameAllowlist.includes( Config.E2E_TEST_USERNAME ) ) {
    const message = "This e2e test deletes observations of the user under test."
    + "Add this username to the `testUsernameAllowlist` if that's really what you want.";
    throw new Error( message );
  }

  const apiClient = create( {
    baseURL: apiHost,
    headers: {
      "User-Agent": userAgent,
      "X-Installation-ID": installId
    }
  } );

  await apiClient.get( "/logout" );

  const formData = {
    format: "json",
    grant_type: "password",
    client_id: Config.OAUTH_CLIENT_ID,
    client_secret: Config.OAUTH_CLIENT_SECRET,
    username: Config.E2E_TEST_USERNAME,
    password: Config.E2E_TEST_PASSWORD,
    locale: "en"
  };

  const tokenResponse = await apiClient.post( "/oauth/token", formData );
  const accessToken = tokenResponse.data.access_token;

  apiClient.setHeader( "Authorization", `Bearer ${accessToken}` );

  const jwtResponse = await apiClient.get( "/users/api_token.json" );

  const opts = {
    api_token: jwtResponse.data.api_token
  };

  const announcementSearchParams = {
    placement: "mobile",
    locale: "en-US",
    per_page: 20,
    fields: {
      id: true,
      body: true,
      dismissible: true,
      start: true,
      placement: true
    }
  };

  const announcementResponse = await inatjs.announcements.search(
    announcementSearchParams,
    opts
  );

  const announcementIdsToDismiss = announcementResponse
    .results
    .filter( a => a.dismissable )
    .map( a => a.id );

  console.log( `Dismissing ${announcementIdsToDismiss.length} announcements` );

  await Promise.all( announcementIdsToDismiss.map( async id => {
    await inatjs.announcements.dismiss(
      { id },
      opts
    );
  } ) );

  const usersEditResponse = await apiClient.get(
    "/users/edit.json",
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": userAgent
      }
    }
  );

  const userId = usersEditResponse.data.id;

  const observationResponse = await inatjs.observations.search( { user_id: userId }, opts );

  // is this _really_ an e2e test user if they have more than expected observations?
  const suspiciousObservationThreshold = 10;
  if ( typeof observationResponse.total_results !== "number"
     || observationResponse.total_results > suspiciousObservationThreshold ) {
    const message
        = `More than ${suspiciousObservationThreshold} observations found for test user. Aborting.`;
    throw new Error( message );
  }

  const observationIdsToDelete = observationResponse.results.map( a => a.uuid );

  console.log( `Deleting ${observationIdsToDelete.length} observations` );

  await Promise.all( observationIdsToDelete.map( async uuid => {
    console.log( { uuid } );
    const deleteResponse = await inatjs.observations.delete(
      { uuid },
      opts
    );
    console.log( { uuid, deleteResponse, stringify: JSON.stringify( deleteResponse ) } );
  } ) );

  await apiClient.get( "/logout" );

  console.log(
    "Test user reset: announcements dismissed and observations deleted"
  );
}
