/* eslint-disable i18next/no-literal-string */
import {
  SwitchRow,
} from "components/SharedComponents";
import React from "react";
import { useFeatureFlag } from "sharedHooks";
import type { FeatureFlagSlice } from "stores/createFeatureFlagSlice";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

import { H1, H2 } from "./DeveloperSharedComponents";

// setting feature flag overrides is "dangerous" in the sense that we don't want to accidentally
// set them in application code so this is colocated with the only code that _should_
const useFeatureFlagForDebug = ( featureFlagKey: FeatureFlag ) => {
  const resolvedValue = useFeatureFlag( featureFlagKey );

  const featureFlagConfig = useStore( ( state: FeatureFlagSlice ) => state.featureFlagConfig );
  const featureFlagOverrides
    = useStore( ( state: FeatureFlagSlice ) => state.featureFlagDebugOverrides );
  const setOverride = useStore( ( state: FeatureFlagSlice ) => state.setFeatureFlagDebugOverride );

  const rawValue = featureFlagConfig[featureFlagKey];
  const overrideValue = featureFlagOverrides[featureFlagKey];
  return {
    resolvedValue,
    rawValue,
    overrideValue,
    setOverride: ( enabled: boolean ) => setOverride( featureFlagKey, enabled ),
    clearOverride: () => setOverride( featureFlagKey, null ),
  };
};

const trimFlagName = ( featureFlagKey: FeatureFlag ) => featureFlagKey.replace( "Enabled", "" );

const getStatusText = ( enabled: boolean ) => ( enabled
  ? "Enabled"
  : "Disabled" );

const FeatureFlagToggle = ( { featureFlagKey }: { featureFlagKey: FeatureFlag } ) => {
  const {
    resolvedValue,
    rawValue,
    overrideValue,
    setOverride,
    clearOverride,
  } = useFeatureFlagForDebug( featureFlagKey );
  const hasOverride = overrideValue !== null;
  return (
    <>
      <H2>{`${trimFlagName( featureFlagKey )}: ${getStatusText( resolvedValue )}`}</H2>
      <SwitchRow
        label={`Override default value of ${rawValue}`}
        value={hasOverride}
        onValueChange={() => ( hasOverride
          ? clearOverride()
          : setOverride( rawValue ) )}
      />
      {hasOverride && (
        <SwitchRow
          label="Enable"
          value={overrideValue}
          onValueChange={() => setOverride( !overrideValue )}
          classNames="mt-[15px]"
        />
      )}
    </>
  );
};

const FeatureFlags = () => {
  const featureFlagKeys = Object.values( FeatureFlag );
  return (
    <>
      <H1>Feature Flags</H1>
      {featureFlagKeys.map( featureFlagKey => (
        <FeatureFlagToggle key={featureFlagKey} featureFlagKey={featureFlagKey} />
      ) )}
    </>
  );
};

export default FeatureFlags;
