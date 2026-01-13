import type { StateCreator } from "zustand";

// TODO: move this to more a more global type definition scope
export enum FeatureFlag {
  ExploreV2Enabled = "exploreV2Enabled"
}

const initialFeatureFlagConfig: Record<FeatureFlag, boolean> = {
  [FeatureFlag.ExploreV2Enabled]: false,
};

const initialFeatureFlagOverrides: Record<FeatureFlag, boolean | null> = {
  [FeatureFlag.ExploreV2Enabled]: null,
};

const DEFAULT_STATE = {
  featureFlagConfig: initialFeatureFlagConfig,
  featureFlagOverrides: initialFeatureFlagOverrides,
};

export interface FeatureFlagForDebug {
  featureFlagKey: FeatureFlag;
  resolvedValue: boolean;
  rawValue: boolean;
  overrideValue: boolean | null;
  hasOverride: boolean;
  setOverride: ( enabled: boolean ) => void;
  clearOverride: ( ) => void;
}

interface ExploreSlice {
  featureFlagConfig: Record<FeatureFlag, boolean>;
  featureFlagOverrides: Record<FeatureFlag, boolean | null>;
  getFeatureFlag: ( featureFlagKey: FeatureFlag ) => boolean;
  getFeatureFlagForDebug: ( featureFlagKey: FeatureFlag ) => FeatureFlagForDebug;
}

const createFeatureFlagSlice: StateCreator<ExploreSlice> = ( set, get ) => ( {
  ...DEFAULT_STATE,
  getFeatureFlag: featureFlagKey => {
    const override = get().featureFlagOverrides[featureFlagKey];
    if ( override !== null ) {
      return override;
    }
    return get().featureFlagConfig[featureFlagKey];
  },
  getFeatureFlagForDebug: featureFlagKey => {
    const resolvedValue = get().getFeatureFlag( featureFlagKey );
    const rawValue = get().featureFlagConfig[featureFlagKey];
    const overrideValue = get().featureFlagOverrides[featureFlagKey];
    return {
      featureFlagKey,
      resolvedValue,
      rawValue,
      overrideValue,
      hasOverride: overrideValue !== null,
      clearOverride: () => set( state => ( {
        ...state,
        featureFlagOverrides: {
          ...state.featureFlagOverrides,
          [featureFlagKey]: null,
        },
      } ) ),
      setOverride: enabled => set( state => ( {
        ...state,
        featureFlagOverrides: {
          ...state.featureFlagOverrides,
          [featureFlagKey]: enabled,
        },
      } ) ),
    };
  },
} );

export default createFeatureFlagSlice;
