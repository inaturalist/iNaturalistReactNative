import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import type { UserPojo } from "realmModels/User";
import type { FeatureFlag } from "stores/createFeatureFlagSlice";
import {
  flagsEnabledForAdminsInTestFlight,
  hardcodedFeatureFlagDefaults,
} from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

import useCurrentUser from "./useCurrentUser";

const isTestFlightBuild = Platform.select( {
  ios: DeviceInfo.getInstallerPackageNameSync() === "TestFlight",
  default: false,
} );

export const flagEnabledForAdminTestFlight = (
  featureFlagKey: FeatureFlag,
  user: UserPojo | null,
) => !!( isTestFlightBuild
    && user?.roles.includes( "admin" )
    && flagsEnabledForAdminsInTestFlight.includes( featureFlagKey ) );

export type FeatureFlagSource = "override" | "api" | "adminTestFlight" | "hardcoded";

interface FeatureFlagLayers {
  override: boolean | null;
  apiValue: boolean | undefined;
  adminTestFlight: boolean;
  hardcoded: boolean;
}

// The first layer with a value wins. An API value of `false` counts as a value: only a flag
// missing from the API response falls through to the hard-coded default
export const resolveFeatureFlag = ( {
  override,
  apiValue,
  adminTestFlight,
  hardcoded,
}: FeatureFlagLayers ): { enabled: boolean; source: FeatureFlagSource } => {
  if ( override !== null ) {
    return { enabled: override, source: "override" };
  }
  if ( apiValue !== undefined ) {
    return { enabled: apiValue, source: "api" };
  }
  if ( adminTestFlight ) {
    return { enabled: true, source: "adminTestFlight" };
  }
  return { enabled: hardcoded, source: "hardcoded" };
};

export const useFeatureFlagLayers = ( featureFlagKey: FeatureFlag ): FeatureFlagLayers => {
  const currentUser = useCurrentUser();
  const override = useStore( state => state.featureFlagDebugOverrides[featureFlagKey] );
  const apiValue = useStore( state => state.featureFlagApiValues[featureFlagKey] );
  return {
    override,
    apiValue,
    adminTestFlight: flagEnabledForAdminTestFlight( featureFlagKey, currentUser ),
    hardcoded: hardcodedFeatureFlagDefaults[featureFlagKey],
  };
};

const useFeatureFlag = ( featureFlagKey: FeatureFlag ) => resolveFeatureFlag(
  useFeatureFlagLayers( featureFlagKey ),
).enabled;

export default useFeatureFlag;
