import type { DynamicConfigItem } from "types/dynamicConfig";
import { DevOnlyFlag, FeatureFlag } from "types/dynamicConfig";
import type { StateCreator } from "zustand";

// This state manages configuration for internal behavior that can be changed on the fly
// separate from user settings. This includes Feature Flags or other development config.

// The "status" / "enabledness" of whether a config flag is "on" or "off" in the live app
// is driven by the hard-coded entry here in `initialDynamicConfig`. That is,
// when we want to "turn on" `MyFeature` for the public, we will set its
// `initialFeatureFlagConfig` to true.

// This slice _also_ supports dynamically enabling and disabling a flag for testing,
// overriding its default "live" status for. These are not persisted so will be reset to
// their defaults on app start.

type DynamicConfigSection<T extends DynamicConfigItem> = Record<T, boolean>
export type DynamicConfigSectionDebugOverrides<T extends DynamicConfigItem>
  = Record<T, boolean | null>

export type DynamicConfig = Record<DynamicConfigItem, boolean>
// export interface DynamicConfig {
//   featureFlags: DynamicConfigSection<FeatureFlag>;
//   devOnlyFlags: DynamicConfigSection<DevOnlyFlag>;
// }

type DynamicConfigDebugOverrides = Record<DynamicConfigItem, boolean | null>

const initialFeatureFlagConfig: DynamicConfigSection<FeatureFlag> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: false,
  [FeatureFlag.ExploreV2Enabled]: false,
};

const initialDevOnlyFlagConfig: DynamicConfigSection<DevOnlyFlag> = {
  // [DevOnlyFlag.MyDevOnlyFlagEnabled]: false,
  [DevOnlyFlag.SimulateAirplaneModeEnabled]: false,
};
const initialDynamicConfig: DynamicConfig = {
  ...initialFeatureFlagConfig,
  ...initialDevOnlyFlagConfig,
};

// const initialDynamicConfig: DynamicConfig = {
//   featureFlags: initialFeatureFlagConfig,
//   devOnlyFlags: initialDevOnlyFlagConfig,
// };

const initialFeatureFlagDebugOverrides: DynamicConfigSectionDebugOverrides<FeatureFlag> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: null,
  [FeatureFlag.ExploreV2Enabled]: null,
};

const initialDevOnlyFlagDebugOverrides: DynamicConfigSectionDebugOverrides<DevOnlyFlag> = {
  // [DevOnlyFlag.MyDevOnlyFlagEnabled]: null,
  [DevOnlyFlag.SimulateAirplaneModeEnabled]: null,
};

const initialDynamicConfigDebugOverrides: DynamicConfigDebugOverrides = {
  ...initialFeatureFlagDebugOverrides,
  ...initialDevOnlyFlagDebugOverrides,
};

const DEFAULT_STATE = {
  dynamicConfig: initialDynamicConfig,
  dynamicConfigDebugOverrides: initialDynamicConfigDebugOverrides,
};

export interface DynamicConfigSlice {
  dynamicConfig: DynamicConfig;
  dynamicConfigDebugOverrides: DynamicConfigDebugOverrides;
  setDynamicConfigDebugOverride: (
    dynamicConfigKey: DynamicConfigItem,
    override: boolean | null
  ) => void;
}

const initializeDynamicConfigSlice: StateCreator<DynamicConfigSlice> = set => ( {
  ...DEFAULT_STATE,
  setDynamicConfigDebugOverride: ( dynamicConfigKey, override ) => set( state => ( {
    ...state,
    dynamicConfigDebugOverrides: {
      ...state.dynamicConfigDebugOverrides,
      [dynamicConfigKey]: override,
    },
  } ) ),
} );

export default initializeDynamicConfigSlice;
