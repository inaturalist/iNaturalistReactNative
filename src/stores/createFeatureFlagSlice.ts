import type { StateCreator } from "zustand";

// This state slice supports application code's consumption of feature flags, namely:
// const isMyFeatureEnabled = useFeatureFlag ( FeatureFlag.MyFeatureFlagEnabled );

// The "status" / "enabledness" of whether a feature flag'd feature is "on" or "off" in the live app
// is driven by the hard-coded entry here in `initialFeatureFlagConfig`. That is,
// when we want to "turn on" `MyFeature`, we will set its `initialFeatureFlagConfig` to true.

// To add a new feature flag, add entries below, following the example of `MyFeatureFlagEnabled`.
// The enum value is the flag's base name in snake_case, named for the feature. Create it in
// Flipper as `client_<name>`: only `client_` flags are returned to the app, and Flipper flags
// can't be renamed. Creating the flag in Flipper (in each environment) is only needed to
// control it remotely, and a newly created Flipper flag is off for everyone until a gate is added

// Once a feature has been enabled, deployed, and verified, the feature flag should be removed
// along with the newly-deprecated / "old" code.

// This slice _also_ supports dynamically enabling and disabling a flag for testing,
// overriding its default "live" status. This is done through the "Debug" / "Developer" screen.
// These are not persisted so will be reset to their defaults on app start.

// When adding a new feature flag, consider creating a Linear ticket to track removing the
// flag and obviated dead code
export enum FeatureFlag {
  // flags should use positive language ending with `Enabled`
  // MyFeatureFlagEnabled = "my_feature",
  ExploreV2Enabled = "explore_v2",
  TraditionalProjectsEnabled = "traditional_projects",
  MyObservationsSmallGridViewEnabled = "my_observations_small_grid_view",
  OnboardingV2Enabled = "onboarding_v2",
}

export const flagsEnabledForAdminsInTestFlight: FeatureFlag[] = [];

const initialFeatureFlagConfig: Record<FeatureFlag, boolean> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: false,
  [FeatureFlag.ExploreV2Enabled]: true,
  [FeatureFlag.TraditionalProjectsEnabled]: false,
  [FeatureFlag.MyObservationsSmallGridViewEnabled]: false,
  [FeatureFlag.OnboardingV2Enabled]: false,
};

const initialFeatureFlagDebugOverrides: Record<FeatureFlag, boolean | null> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: null,
  [FeatureFlag.ExploreV2Enabled]: null,
  [FeatureFlag.TraditionalProjectsEnabled]: null,
  [FeatureFlag.MyObservationsSmallGridViewEnabled]: null,
  [FeatureFlag.OnboardingV2Enabled]: null,
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
