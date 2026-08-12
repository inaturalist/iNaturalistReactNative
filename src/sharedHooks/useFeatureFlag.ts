import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import type { UserPojo } from "realmModels/User";
import type { FeatureFlag, FeatureFlagSlice } from "stores/createFeatureFlagSlice";
import { flagsEnabledForAdminsInTestFlight } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

import useCurrentUser from "./useCurrentUser";

const isTestFlightBuild = Platform.select( {
  ios: DeviceInfo.getInstallerPackageNameSync() === "TestFlight",
  default: false,
} );

export const flagEnabledForAdminTestFlight = (
  featureFlagKey: FeatureFlag,
  user: UserPojo | null,
) => isTestFlightBuild
    && user?.roles.includes( "admin" )
    && flagsEnabledForAdminsInTestFlight.includes( featureFlagKey );

const useFeatureFlag = ( featureFlagKey: FeatureFlag ) => {
  const currentUser = useCurrentUser();
  const featureFlagConfig = useStore( ( state: FeatureFlagSlice ) => state.featureFlagConfig );
  const featureFlagOverrides
    = useStore( ( state: FeatureFlagSlice ) => state.featureFlagDebugOverrides );
  const override = featureFlagOverrides[featureFlagKey];
  if ( override !== null ) {
    return override;
  }
  const isFlagEnabledForAdminTestFlight
    = flagEnabledForAdminTestFlight( featureFlagKey, currentUser );
  if ( isFlagEnabledForAdminTestFlight ) {
    return true;
  }
  return featureFlagConfig[featureFlagKey];
};

export default useFeatureFlag;
