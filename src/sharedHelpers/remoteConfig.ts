import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
  setConfigSettings,
  setDefaults,
} from "@react-native-firebase/remote-config";
import { log } from "sharedHelpers/logger";
import { FeatureFlag, initialFeatureFlagConfig } from "stores/createFeatureFlagSlice";

const logger = log.extend( "remoteConfig.ts" );

// allow devs to see console-side changes immediately without waiting on a stale cache
const MINIMUM_FETCH_INTERVAL_MILLIS = __DEV__
  ? 0
  : 3600000;

export const getRemoteFeatureFlagConfig = (): Record<FeatureFlag, boolean> => {
  const remoteConfig = getRemoteConfig();
  const config = { ...initialFeatureFlagConfig };
  Object.values( FeatureFlag ).forEach( featureFlagKey => {
    config[featureFlagKey] = getValue( remoteConfig, featureFlagKey ).asBoolean();
  } );
  return config;
};

export const fetchAndActivateFeatureFlags = async (): Promise<Record<FeatureFlag, boolean>> => {
  try {
    const remoteConfig = getRemoteConfig();
    await setConfigSettings( remoteConfig, {
      minimumFetchIntervalMillis: MINIMUM_FETCH_INTERVAL_MILLIS,
    } );
    await setDefaults( remoteConfig, initialFeatureFlagConfig );
    await fetchAndActivate( remoteConfig );
  } catch ( error ) {
    logger.error( "Error fetching remote config feature flags", JSON.stringify( error ) );
  }
  return getRemoteFeatureFlagConfig();
};
