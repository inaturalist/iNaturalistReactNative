import type { FeatureFlag, FeatureFlagSlice } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

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

export const useFeatureFlagForDebug = ( featureFlagKey: FeatureFlag ) => {
  const resolvedValue = useFeatureFlag( featureFlagKey );

  const featureFlagConfig = useStore( ( state: FeatureFlagSlice ) => state.featureFlagConfig );
  const featureFlagOverrides
    = useStore( ( state: FeatureFlagSlice ) => state.featureFlagDebugOverrides );
  const setOverride = useStore( ( state: FeatureFlagSlice ) => state.setFeatureFlagDebugOverride );

  const rawValue = featureFlagConfig[featureFlagKey];
  const overrideValue = featureFlagOverrides[featureFlagKey];
  return {
    resolvedValue,
    rawValue,
    overrideValue,
    setOverride: ( enabled: boolean ) => setOverride( featureFlagKey, enabled ),
    clearOverride: () => setOverride( featureFlagKey, null ),
  };
};

export default useFeatureFlag;
