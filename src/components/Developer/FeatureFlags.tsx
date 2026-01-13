/* eslint-disable i18next/no-literal-string */
import {
  Body1,
  Button,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { Switch } from "react-native-paper";
import { useFeatureFlagForDebug } from "sharedHooks/useFeatureFlag";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import colors from "styles/tailwindColors";

import { H1, P } from "./DeveloperSharedComponents";

const FeatureFlagToggle = ( { featureFlagKey }: { featureFlagKey: FeatureFlag } ) => {
  const bloop = useFeatureFlagForDebug( featureFlagKey );
  console.log( bloop );
  const {
    resolvedValue,
    rawValue,
    overrideValue,
    hasOverride,
    setOverride,
    clearOverride,
  } = bloop;
  return (
    <>
      <View className="flex-row items-center ">
        <Switch
          value={resolvedValue}
          disabled={!hasOverride}
          onValueChange={() => setOverride( !resolvedValue )}
          color={colors.inatGreen}
        />
        <Body1 className="ml-3 flex-1">{featureFlagKey}</Body1>
        {hasOverride
          ? <Button onPress={clearOverride} text="Reset" />
          : <Button onPress={() => setOverride( !rawValue )} text="Override" />}
      </View>
      <P>
        {`Resolved: ${resolvedValue}, Raw: ${rawValue}, Override: ${overrideValue}`}
      </P>
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
