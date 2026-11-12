import fetchFeatureFlags from "api/featureFlags";
import { log } from "sharedHelpers/logger";
import type { FeatureFlagSource } from "sharedHooks/useFeatureFlag";
import { resolveFeatureFlag } from "sharedHooks/useFeatureFlag";
import { FeatureFlag, hardcodedFeatureFlagDefaults } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

const logger = log.extend( "syncFeatureFlags" );

let latestRequestId = 0;

// Each flag's resolved value and the layer it came from, for remote logs, e.g.
// {
//   explore_v2: true,
//   traditional_projects: false,
//   my_observations_small_grid_view: false,
//   onboarding_v2: false,
//   fromOverrides: "traditional_projects,explore_v2",
//   fromApi: "",
// }
export const featureFlagsLogExtra = ( ) => {
  const { featureFlagApiValues, featureFlagDebugOverrides } = useStore.getState( );
  const values: Partial<Record<FeatureFlag, boolean>> = {};
  const flagsBySource: Record<FeatureFlagSource, FeatureFlag[]> = {
    override: [],
    api: [],
    // adminTestFlight needs Realm & User which is not worth
    // pulling in here since it'll be removed soon.
    // added here to satisfy FeatureFlagSource type
    adminTestFlight: [],
    hardcoded: [],
  };
  Object.values( FeatureFlag ).forEach( featureFlag => {
    const { enabled, source } = resolveFeatureFlag( {
      override: featureFlagDebugOverrides[featureFlag],
      apiValue: featureFlagApiValues[featureFlag],
      adminTestFlight: false,
      hardcoded: hardcodedFeatureFlagDefaults[featureFlag],
    } );
    values[featureFlag] = enabled;
    flagsBySource[source].push( featureFlag );
  } );
  return {
    ...values,
    fromOverrides: flagsBySource.override.join( "," ),
    fromApi: flagsBySource.api.join( "," ),
  };
};

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
    logger.infoWithExtra(
      "Feature flags loaded from API",
      { ...featureFlagsLogExtra( ), signedIn },
    );
  } catch ( error ) {
    if ( requestId !== latestRequestId ) return;
    setFeatureFlagApiError( signedIn );
    logger.warnWithExtra(
      "Failed to fetch feature flags, using hard-coded defaults",
      error,
      { ...featureFlagsLogExtra( ), signedIn },
    );
  }
};

// Drops in-flight syncs before they touch the store. signOut calls this first: a store write
// after it clears MMKV would persist the departing user's state again before the restart
export const cancelFeatureFlagSync = ( ) => {
  latestRequestId += 1;
};

export default syncFeatureFlags;
