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

// TODO: move this to more a more global type definition scope
export enum FeatureFlag {
  // flags should use positive language ending with `Enabled`
  // MyFeatureFlagEnabled = "myFeatureFlagEnabled",
  ExploreV2Enabled = "exploreV2Enabled",
  NewsEnabled = "newsEnabled",
}

const initialFeatureFlagConfig: Record<FeatureFlag, boolean> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: false,
  [FeatureFlag.ExploreV2Enabled]: false,
  [FeatureFlag.NewsEnabled]: false,
};

const initialFeatureFlagDebugOverrides: Record<FeatureFlag, boolean | null> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: null,
  [FeatureFlag.ExploreV2Enabled]: null,
  [FeatureFlag.NewsEnabled]: null,
};

const DEFAULT_STATE = {
  featureFlagConfig: initialFeatureFlagConfig,
  featureFlagDebugOverrides: initialFeatureFlagDebugOverrides,
};

export interface FeatureFlagSlice {
  featureFlagConfig: Record<FeatureFlag, boolean>;
  featureFlagDebugOverrides: Record<FeatureFlag, boolean | null>;
  /**
   * WARNING
   *
   * DO NOT call this anywhere except from the Feature Flag management in the "Debug" screen
   */
  setFeatureFlagDebugOverride: ( featureFlagKey: FeatureFlag, override: boolean | null ) => void;
}

const createFeatureFlagSlice: StateCreator<FeatureFlagSlice> = set => ( {
  ...DEFAULT_STATE,
  setFeatureFlagDebugOverride: ( featureFlagKey, override ) => set( state => ( {
    ...state,
    featureFlagDebugOverrides: {
      ...state.featureFlagDebugOverrides,
      [featureFlagKey]: override,
    },
  } ) ),
} );

export default createFeatureFlagSlice;
