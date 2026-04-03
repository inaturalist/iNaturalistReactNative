import type { FeatureFlagSlice } from "stores/createDynamicConfigSlice";
import useStore from "stores/useStore";
import type { FeatureFlag } from "types/dynamicConfig";

const useFeatureFlag = ( featureFlagKey: FeatureFlag ) => {
  const featureFlagConfig = useStore( ( state: FeatureFlagSlice ) => state.featureFlagConfig );
  const featureFlagOverrides
    = useStore( ( state: FeatureFlagSlice ) => state.featureFlagDebugOverrides );
  const override = featureFlagOverrides[featureFlagKey];
  if ( override !== null ) {
    return override;
  }
  return featureFlagConfig[featureFlagKey];
};

export default useFeatureFlag;
