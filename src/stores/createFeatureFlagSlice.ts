import type { StateCreator } from "zustand";

// This state slice supports application code's consumption of feature flags, namely:
// const isMyFeatureEnabled = useFeatureFlag ( FeatureFlag.MyFeatureFlagEnabled );

// A flag resolves to the first of these that has a value (see `resolveFeatureFlag`):
// 1. a local override set from the "Debug" / "Developer" screen. These are not persisted
//    so will be reset to their defaults on app start.
// 2. the value returned by the API's `/v2/feature_flags`, which is driven by Flipper on the web
//    (/admin/feature_flags/flipper). Fetched on app start and when the signed-in user changes
// 3. `flagsEnabledForAdminsInTestFlight`, for admins on iOS TestFlight builds
// 4. the hard-coded entry in `hardcodedFeatureFlagDefaults`. Used whenever the API didn't
//    return the flag: offline, request failed, or the flag doesn't exist in Flipper

// To add a new feature flag, add entries below, following the example of `MyFeatureFlagEnabled`.
// The enum value is the flag's base name in snake_case, named for the feature. Create it in
// Flipper as `client_<name>`: only `client_` flags are returned to the app, and Flipper flags
// can't be renamed. Creating the flag in Flipper (in each environment) is only needed to
// control it remotely, and a newly created Flipper flag is off for everyone until a gate is added

// Once a feature has been enabled, deployed, and verified, the feature flag should be removed
// along with the newly-deprecated / "old" code.

// When adding a new feature flag, consider creating a Linear ticket to track removing the
// flag and obviated dead code
export enum FeatureFlag {
  // flags should use positive language ending with `Enabled`
  // MyFeatureFlagEnabled = "my_feature",
  TraditionalProjectsEnabled = "traditional_projects",
  MyObservationsSmallGridViewEnabled = "my_observations_small_grid_view",
  OnboardingV2Enabled = "onboarding_v2",
}

export const flagsEnabledForAdminsInTestFlight: FeatureFlag[] = [
  FeatureFlag.MyObservationsSmallGridViewEnabled,
];

export const hardcodedFeatureFlagDefaults: Record<FeatureFlag, boolean> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: false,
  [FeatureFlag.TraditionalProjectsEnabled]: false,
  [FeatureFlag.MyObservationsSmallGridViewEnabled]: false,
  [FeatureFlag.OnboardingV2Enabled]: false,
};

const initialFeatureFlagDebugOverrides: Record<FeatureFlag, boolean | null> = {
  // [FeatureFlag.MyFeatureFlagEnabled]: null,
  [FeatureFlag.TraditionalProjectsEnabled]: null,
  [FeatureFlag.MyObservationsSmallGridViewEnabled]: null,
  [FeatureFlag.OnboardingV2Enabled]: null,
};

export type FeatureFlagApiStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "loaded"; fetchedAt: number; signedIn: boolean }
  | { state: "error"; failedAt: number; signedIn: boolean };

const DEFAULT_STATE = {
  featureFlagApiValues: {} as Partial<Record<FeatureFlag, boolean>>,
  featureFlagApiStatus: { state: "idle" } as FeatureFlagApiStatus,
  featureFlagDebugOverrides: initialFeatureFlagDebugOverrides,
};

export interface FeatureFlagSlice {
  featureFlagApiValues: Partial<Record<FeatureFlag, boolean>>;
  featureFlagApiStatus: FeatureFlagApiStatus;
  featureFlagDebugOverrides: Record<FeatureFlag, boolean | null>;
  setFeatureFlagApiLoading: ( ) => void;
  setFeatureFlagApiValues: (
    values: Partial<Record<FeatureFlag, boolean>>,
    signedIn: boolean,
  ) => void;
  setFeatureFlagApiError: ( signedIn: boolean ) => void;
  /**
   * WARNING
   *
   * DO NOT call this anywhere except from the Feature Flag management in the "Debug" screen
   */
  setFeatureFlagDebugOverride: ( featureFlagKey: FeatureFlag, override: boolean | null ) => void;
  /**
   * WARNING
   *
   * DO NOT call this anywhere except from the Feature Flag management in the "Debug" screen
   */
  clearFeatureFlagDebugOverrides: ( ) => void;
}

const createFeatureFlagSlice: StateCreator<FeatureFlagSlice> = set => ( {
  ...DEFAULT_STATE,
  setFeatureFlagApiLoading: ( ) => set( { featureFlagApiStatus: { state: "loading" } } ),
  setFeatureFlagApiValues: ( values, signedIn ) => set( {
    featureFlagApiValues: values,
    featureFlagApiStatus: { state: "loaded", fetchedAt: Date.now( ), signedIn },
  } ),
  setFeatureFlagApiError: signedIn => set( {
    featureFlagApiValues: {},
    featureFlagApiStatus: { state: "error", failedAt: Date.now( ), signedIn },
  } ),
  setFeatureFlagDebugOverride: ( featureFlagKey, override ) => set( state => ( {
    ...state,
    featureFlagDebugOverrides: {
      ...state.featureFlagDebugOverrides,
      [featureFlagKey]: override,
    },
  } ) ),
  clearFeatureFlagDebugOverrides: ( ) => set( {
    featureFlagDebugOverrides: initialFeatureFlagDebugOverrides,
  } ),
} );

// True once the latest /v2/feature_flags fetch has finished or failed; until then flags are only
// their hard-coded defaults. Rendering from a flag doesn't need this. Code that acts on a flag
// (writes storage, navigates, logs) should wait for it
export const selectFeatureFlagsSettled = ( state: FeatureFlagSlice ): boolean => (
  state.featureFlagApiStatus.state === "loaded" || state.featureFlagApiStatus.state === "error"
);

export default createFeatureFlagSlice;
