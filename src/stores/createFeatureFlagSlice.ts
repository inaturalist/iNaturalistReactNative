import type { StateCreator } from "zustand";

// TODO: move this to more a more global type definition scope
export enum FeatureFlag {
  // flags should use positive language ending with `Enabled`
  ExploreV2Enabled = "exploreV2Enabled"
}

const initialFeatureFlagConfig: Record<FeatureFlag, boolean> = {
  [FeatureFlag.ExploreV2Enabled]: false,
};

const initialFeatureFlagDebugOverrides: Record<FeatureFlag, boolean | null> = {
  [FeatureFlag.ExploreV2Enabled]: null,
};

const DEFAULT_STATE = {
  featureFlagConfig: initialFeatureFlagConfig,
  featureFlagDebugOverrides: initialFeatureFlagDebugOverrides,
};

export interface FeatureFlagSlice {
  featureFlagConfig: Record<FeatureFlag, boolean>;
  featureFlagDebugOverrides: Record<FeatureFlag, boolean | null>;
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
