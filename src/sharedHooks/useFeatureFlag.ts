import type { FeatureFlag, FeatureFlagForDebug } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

const useFeatureFlag = ( featureFlagKey: FeatureFlag ) => {
  const getFeatureFlag = useStore( state => state.getFeatureFlag );
  return getFeatureFlag( featureFlagKey );
};

export const useFeatureFlagForDebug = ( featureFlagKey: FeatureFlag ) => {
  const getFeatureFlagForDebug = useStore( state => state.getFeatureFlagForDebug );

  return getFeatureFlagForDebug( featureFlagKey ) as FeatureFlagForDebug;
};

export default useFeatureFlag;
