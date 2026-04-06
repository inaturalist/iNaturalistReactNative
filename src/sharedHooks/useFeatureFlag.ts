import type { DynamicConfigSlice } from "stores/createDynamicConfigSlice";
import useStore from "stores/useStore";
import type { FeatureFlag } from "types/dynamicConfig";

const useFeatureFlag = ( featureFlagKey: FeatureFlag ) => {
  const featureFlagConfig = useStore( ( state: DynamicConfigSlice ) => state.dynamicConfig );
  const featureFlagOverrides
    = useStore( ( state: DynamicConfigSlice ) => state.dynamicConfigDebugOverrides );
  const override = featureFlagOverrides[featureFlagKey];
  if ( override !== null ) {
    return override;
  }
  return featureFlagConfig[featureFlagKey];
};

export default useFeatureFlag;
