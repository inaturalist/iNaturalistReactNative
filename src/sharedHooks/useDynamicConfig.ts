import { useCallback } from "react";
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

export const useDynamicConfigInternals = ( configKey: DynamicConfigItem ) => {
  const resolvedValue = useDynamicConfig( configKey );

  const dynamicConfig = useStore( ( state: DynamicConfigSlice ) => state.dynamicConfig );
  const dynamicConfigOverrides
    = useStore( ( state: DynamicConfigSlice ) => state.dynamicConfigDebugOverrides );
  const storeSetOverride
    = useStore( ( state: DynamicConfigSlice ) => state.setDynamicConfigDebugOverride );

  const rawValue = dynamicConfig[configKey];
  const overrideValue = dynamicConfigOverrides[configKey];

  const setOverride = useCallback(
    ( enabled: boolean ) => storeSetOverride( configKey, enabled ),
    [configKey, storeSetOverride],
  );
  const clearOverride = useCallback(
    () => storeSetOverride( configKey, null ),
    [configKey, storeSetOverride],
  );

  return {
    resolvedValue,
    rawValue,
    overrideValue,
    setOverride,
    clearOverride,
  };
};
