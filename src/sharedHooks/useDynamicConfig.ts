import type { DynamicConfigSlice } from "stores/createDynamicConfigSlice";
import useStore from "stores/useStore";
import type { DevOnlyFlag, DynamicConfigItem, FeatureFlag } from "types/dynamicConfig";

const useDynamicConfig
  = ( configKey: DynamicConfigItem ) => {
    const dynamicConfig = useStore( ( state: DynamicConfigSlice ) => state.dynamicConfig );
    const dynamicConfigOverrides
    = useStore( ( state: DynamicConfigSlice ) => state.dynamicConfigDebugOverrides );
    const override = dynamicConfigOverrides[configKey];
    if ( override !== null ) {
      return override;
    }
    return dynamicConfig[configKey];
  };

export const useFeatureFlag = ( featureFlag: FeatureFlag ) => useDynamicConfig( featureFlag );
export const useDevOnlyFlag = ( devOnlyFlag: DevOnlyFlag ) => useDynamicConfig( devOnlyFlag );

export default useDynamicConfig;
