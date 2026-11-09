import fetchFeatureFlags from "api/featureFlags";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { log } from "sharedHelpers/logger";
import useStore from "stores/useStore";

const logger = log.extend( "syncFeatureFlags" );

let latestRequestId = 0;

// Fetches Flipper-backed flags into the store. Signed out, the API only returns flags that are
// fully enabled; on failure the store's API values are cleared so hard-coded defaults apply
const syncFeatureFlags = async ( ) => {
  latestRequestId += 1;
  const requestId = latestRequestId;
  const {
    setFeatureFlagApiLoading,
    setFeatureFlagApiValues,
    setFeatureFlagApiError,
  } = useStore.getState( );
  setFeatureFlagApiLoading( );
  let signedIn = false;
  try {
    const apiToken = await getJWT( );
    signedIn = !!apiToken;
    const values = await fetchFeatureFlags( { api_token: apiToken } );
    // a newer sync (e.g. after login) started while this one was in flight
    if ( requestId !== latestRequestId ) return;
    setFeatureFlagApiValues( values, signedIn );
  } catch ( error ) {
    if ( requestId !== latestRequestId ) return;
    logger.warn( "Failed to fetch feature flags, using hard-coded defaults", error );
    setFeatureFlagApiError( signedIn );
  }
};

export default syncFeatureFlags;
