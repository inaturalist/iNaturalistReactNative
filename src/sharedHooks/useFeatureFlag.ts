import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import type { FeatureFlag, FeatureFlagSlice } from "stores/createFeatureFlagSlice";
import { flagsEnabledForAdminsInTestFlight } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

import useCurrentUser from "./useCurrentUser";

const isTestFlightBuild = Platform.select( {
  ios: DeviceInfo.getInstallerPackageNameSync() === "TestFlight",
  default: false,
} );

const useFeatureFlag = ( featureFlagKey: FeatureFlag ) => {
  const userIsAdmin = useCurrentUser()?.roles.includes( "admin" );
  const featureFlagConfig = useStore( ( state: FeatureFlagSlice ) => state.featureFlagConfig );
  const featureFlagOverrides
    = useStore( ( state: FeatureFlagSlice ) => state.featureFlagDebugOverrides );
  const override = featureFlagOverrides[featureFlagKey];
  if ( override !== null ) {
    return override;
  }
  if ( isTestFlightBuild
    && userIsAdmin
    && flagsEnabledForAdminsInTestFlight.includes( featureFlagKey )
  ) {
    return true;
  }
  return featureFlagConfig[featureFlagKey];
};

export default useFeatureFlag;
