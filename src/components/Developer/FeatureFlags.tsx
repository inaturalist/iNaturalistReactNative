/* eslint-disable i18next/no-literal-string */
import {
  SwitchRow,
} from "components/SharedComponents";
import React from "react";
import { useFeatureFlagForDebug } from "sharedHooks/useFeatureFlag";
import { FeatureFlag } from "stores/createFeatureFlagSlice";

import { H1, H2 } from "./DeveloperSharedComponents";

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
