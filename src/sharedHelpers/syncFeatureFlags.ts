import fetchFeatureFlags from "api/featureFlags";
import { log } from "sharedHelpers/logger";
import useStore from "stores/useStore";

const logger = log.extend( "syncFeatureFlags" );

let latestRequestId = 0;

// Fetches Flipper-backed flags into the store. Signed out (no token), the API only returns flags
// that are fully enabled; on failure the store's API values are cleared so hard-coded defaults
// apply. Callers pass the token: getJWT lives in AuthenticationService, which calls this after
// login, so importing it here would be circular
const syncFeatureFlags = async ( apiToken: string | null ) => {
  latestRequestId += 1;
  const requestId = latestRequestId;
  const {
    setFeatureFlagApiLoading,
    setFeatureFlagApiValues,
    setFeatureFlagApiError,
  } = useStore.getState( );
  setFeatureFlagApiLoading( );
  const signedIn = !!apiToken;
  try {
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
