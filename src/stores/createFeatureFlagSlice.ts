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

// When adding a new feature flag, consider creating a Linear ticket to track removing the
// flag and obviated dead code
export enum FeatureFlag {
  // flags should use positive language ending with `Enabled`
  // MyFeatureFlagEnabled = "myFeatureFlagEnabled",
  ExploreV2Enabled = "exploreV2Enabled",
  NewsEnabled = "newsEnabled",
  TraditionalProjectsEnabled = "traditionalProjectsEnabled",
  SearchMyObservationsEnabled = "searchMyObservationsEnabled",
  SortMyObservationsEnabled = "sortMyObservationsEnabled",
  MyObservationsMapViewEnabled = "myObservationsMapViewEnabled",
  MyObservationsSmallGridViewEnabled = "myObservationsSmallGridViewEnabled",
  MeIconTestEnabled = "meIconTestEnabled",
}

export const flagsEnabledForAdminsInTestFlight = [
  FeatureFlag.ExploreV2Enabled,
];

export const initialFeatureFlagConfig: Record<FeatureFlag, boolean> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: false,
  [FeatureFlag.ExploreV2Enabled]: false,
  [FeatureFlag.NewsEnabled]: false,
  [FeatureFlag.TraditionalProjectsEnabled]: false,
  [FeatureFlag.SearchMyObservationsEnabled]: true,
  [FeatureFlag.SortMyObservationsEnabled]: true,
  [FeatureFlag.MyObservationsMapViewEnabled]: true,
  [FeatureFlag.MyObservationsSmallGridViewEnabled]: false,
  [FeatureFlag.MeIconTestEnabled]: false,
};

const initialFeatureFlagDebugOverrides: Record<FeatureFlag, boolean | null> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: null,
  [FeatureFlag.ExploreV2Enabled]: null,
  [FeatureFlag.NewsEnabled]: null,
  [FeatureFlag.TraditionalProjectsEnabled]: null,
  [FeatureFlag.SearchMyObservationsEnabled]: null,
  [FeatureFlag.SortMyObservationsEnabled]: null,
  [FeatureFlag.MyObservationsMapViewEnabled]: null,
  [FeatureFlag.MyObservationsSmallGridViewEnabled]: null,
  [FeatureFlag.MeIconTestEnabled]: null,
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
  /**
   * Replaces the entire feature flag config, e.g. with the result of a
   * Firebase Remote Config fetch. Does not affect debug overrides.
   */
  setFeatureFlagConfig: ( config: Record<FeatureFlag, boolean> ) => void;
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
  setFeatureFlagConfig: config => set( state => ( {
    ...state,
    featureFlagConfig: config,
  } ) ),
} );

export default createFeatureFlagSlice;
