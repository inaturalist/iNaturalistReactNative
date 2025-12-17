import { create } from "apisauce";
import inatjs from "inaturalistjs";
import Config from "react-native-config-node";

import { CHUCKS_PAD as sampleObservation } from "../../src/appConstants/e2e";

const apiHost = Config.OAUTH_API_URL;

const testUsernameAllowlist = [
  "inaturalist-test"
];

const userAgent = "iNaturalistRN/e2e";

inatjs.setConfig( {
  apiURL: Config.API_URL,
  writeApiURL: Config.API_URL,
  userAgent
} );

// programatically dismisses announcements for user and resets to a lone sample observation
// in order to set up consistent testing conditions and remove need to wait for announcements
export default async function resetUserForTesting() {
  console.log(
    "Test user reset: dismissing announcements and resetting observations..."
  );

  if ( !testUsernameAllowlist.includes( Config.E2E_TEST_USERNAME ) ) {
    const message = "This e2e test deletes observations of the user under test. "
    + "Add this username to the `testUsernameAllowlist` if that's really what you want. "
    + "Aborting.";
    throw new Error( message );
  }

  const apiClient = create( {
    baseURL: apiHost,
    headers: {
      "User-Agent": userAgent
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
      dismissible: true
    }
  };

  const announcementResponse = await inatjs.announcements.search(
    announcementSearchParams,
    opts
  );

  const announcementIdsToDismiss = announcementResponse
    .results
    .filter( a => a.dismissible )
    .map( a => a.id );

  console.log( `Dismissing ${announcementIdsToDismiss.length} announcements` );

  await Promise.all( announcementIdsToDismiss.map( async id => {
    try {
      await inatjs.announcements.dismiss(
        { id },
        opts
      );
    } catch ( _error ) {
      console.log( `Could not delete announcement: ${id}. Moving on...` );
    }
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

  if ( typeof observationResponse?.total_results !== "number" ) {
    const message = "Unexpected issue getting test user's observations. Aborting.";
    throw new Error( message );
  }

  // spot check to smell if this is _really_ a test user, we don't want to accidentally delete
  // real observations
  const suspiciousObservationThreshold = 10;
  if ( observationResponse.total_results > suspiciousObservationThreshold ) {
    const message
        = `More than ${suspiciousObservationThreshold} observations found for test user. Aborting.`;
    throw new Error( message );
  }

  const observationIdsToDelete = observationResponse.results.map( a => a.uuid );

  console.log( `Deleting ${observationIdsToDelete.length} observations` );

  await Promise.all( observationIdsToDelete.map( async uuid => {
    try {
      await inatjs.observations.delete(
        { uuid },
        opts
      );
    } catch ( _error ) {
      console.log( `Could not delete observation: ${uuid}. Moving on...` );
    }
  } ) );

  console.log( "Creating sample observation" );
  const sampleObservationParams = {
    observation: {
      latitude: sampleObservation.latitude,
      longitude: sampleObservation.longitude
    }
  };
  await inatjs.observations.create(
    sampleObservationParams,
    opts
  );

  await apiClient.get( "/logout" );

  console.log(
    "Test user reset: announcements dismissed and observations reset"
  );
}
