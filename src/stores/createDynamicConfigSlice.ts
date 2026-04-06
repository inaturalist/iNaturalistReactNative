import { FeatureFlag } from "types/dynamicConfig";
import type { StateCreator } from "zustand";

// This state slice supports application code's consumption of feature flags, namely:
// const isMyFeatureEnabled = useFeatureFlag ( FeatureFlag.MyFeatureFlagEnabled );

// The "status" / "enabledness" of whether a feature flag'd feature is "on" or "off" in the live app
// is driven by the hard-coded entry here in `initialFeatureFlagConfig`. That is,
// when we want to "turn on" `MyFeature`, we will set its `initialFeatureFlagConfig` to true.

// Once a feature has been enabled, deployed, and verified, the feature flag should be removed
// along with the newly-deprecated / "old" code.

// To add a new feature flag, add entries below, following the example of `MyFeatureFlagEnabled`

// This slice _also_ supports dynamically enabling and disabling a flag for testing,
// overriding its default "live" status. This is done through the "Debug" / "Developer" screen.
// These are not persisted so will be reset to their defaults on app start.

// TODO: union w/ new non-FF DyanmicConfig type (for forced offline)
type DynamicConfigItem = FeatureFlag;

type DynamicConfigSection<T extends DynamicConfigItem> = Record<T, boolean>
type DynamicConfigSectionDebugOverrides<T extends DynamicConfigItem> = Record<T, boolean | null>

// TODO: union w/ new non-FF DyanmicConfig type (for forced offline)
type DynamicConfig = DynamicConfigSection<FeatureFlag>
// TODO: union w/ new non-FF DyanmicConfig type (for forced offline)
type DynamicConfigDebugOverrides = DynamicConfigSectionDebugOverrides<FeatureFlag>

const initialFeatureFlagConfig: DynamicConfigSection<FeatureFlag> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: false,
  [FeatureFlag.ExploreV2Enabled]: false,
};

const initialDynamicConfig: DynamicConfig = {
  // TODO: spread new non-FF DyanmicConfig obj (for forced offline)
  ...initialFeatureFlagConfig,
};

const initialFeatureFlagDebugOverrides: DynamicConfigSectionDebugOverrides<FeatureFlag> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: null,
  [FeatureFlag.ExploreV2Enabled]: null,
};

const initialDynamicConfigDebugOverrides: DynamicConfigDebugOverrides = {
  // TODO: spread new non-FF DyanmicConfig obj (for forced offline)
  ...initialFeatureFlagDebugOverrides,
};

const DEFAULT_STATE = {
  dynamicConfig: initialDynamicConfig,
  dynamicConfigDebugOverrides: initialDynamicConfigDebugOverrides,
};

export interface DynamicConfigSlice {
  dynamicConfig: DynamicConfig;
  dynamicConfigDebugOverrides: DynamicConfigDebugOverrides;
  /**
   * WARNING
   *
   * DO NOT call this anywhere except from the Feature Flag management in the "Debug" screen
   */
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
