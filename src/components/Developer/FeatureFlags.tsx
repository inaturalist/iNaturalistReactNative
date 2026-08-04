/* eslint-disable i18next/no-literal-string */
import {
  SwitchRow,
} from "components/SharedComponents";
import React, { useCallback } from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import { flagEnabledForAdminTestFlight } from "sharedHooks/useFeatureFlag";
import type { FeatureFlagSlice } from "stores/createFeatureFlagSlice";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";

import { H1, H2 } from "./DeveloperSharedComponents";

export const useFeatureFlagForDebug = ( featureFlagKey: FeatureFlag ) => {
  const currentUser = useCurrentUser();
  const featureFlagConfig = useStore( ( state: FeatureFlagSlice ) => state.featureFlagConfig );
  const featureFlagOverrides
    = useStore( ( state: FeatureFlagSlice ) => state.featureFlagDebugOverrides );
  const storeSetOverride
    = useStore( ( state: FeatureFlagSlice ) => state.setFeatureFlagDebugOverride );

  const isFlagEnabledForAdminTestFlight
      = flagEnabledForAdminTestFlight( featureFlagKey, currentUser );
  const rawValue = isFlagEnabledForAdminTestFlight || featureFlagConfig[featureFlagKey];
  const overrideValue = featureFlagOverrides[featureFlagKey];

  const resolvedValue = overrideValue === null
    ? rawValue
    : overrideValue;

  const setOverride = useCallback(
    ( enabled: boolean ) => storeSetOverride( featureFlagKey, enabled ),
    [featureFlagKey, storeSetOverride],
  );
  const clearOverride = useCallback(
    () => storeSetOverride( featureFlagKey, null ),
    [featureFlagKey, storeSetOverride],
  );

  return {
    resolvedValue,
    rawValue,
    overrideValue,
    setOverride,
    clearOverride,
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
