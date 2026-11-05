/* eslint-disable i18next/no-literal-string */
import {
  Body2,
  Body3,
  Button,
} from "components/SharedComponents";
import { Pressable, View } from "components/styledComponents";
import React, { useCallback, useState } from "react";
import { Switch } from "react-native-paper";
import syncFeatureFlags from "sharedHelpers/syncFeatureFlags";
import type { FeatureFlagSource } from "sharedHooks/useFeatureFlag";
import { resolveFeatureFlag, useFeatureFlagLayers } from "sharedHooks/useFeatureFlag";
import type { FeatureFlagApiStatus } from "stores/createFeatureFlagSlice";
import { FeatureFlag } from "stores/createFeatureFlagSlice";
import useStore from "stores/useStore";
import colors from "styles/tailwindColors";

import { CODE, H1, P } from "./DeveloperSharedComponents";

export const useFeatureFlagForDebug = ( featureFlagKey: FeatureFlag ) => {
  const layers = useFeatureFlagLayers( featureFlagKey );
  const { enabled, source } = resolveFeatureFlag( layers );
  const storeSetOverride = useStore( state => state.setFeatureFlagDebugOverride );

  const setOverride = useCallback(
    ( value: boolean ) => storeSetOverride( featureFlagKey, value ),
    [featureFlagKey, storeSetOverride],
  );
  const clearOverride = useCallback(
    () => storeSetOverride( featureFlagKey, null ),
    [featureFlagKey, storeSetOverride],
  );

  return {
    resolvedValue: enabled,
    source,
    layers,
    setOverride,
    clearOverride,
  };
};

const trimFlagName = ( featureFlagKey: FeatureFlag ) => featureFlagKey.replace( /^client_/, "" );

const onOff = ( enabled: boolean ) => ( enabled
  ? "ON"
  : "OFF" );

const sourceLabels: Record<FeatureFlagSource, string> = {
  override: "OVERRIDE",
  api: "API",
  adminTestFlight: "ADMIN TESTFLIGHT",
  hardcoded: "DEFAULT",
};

const formatTime = ( timestamp: number ) => new Date( timestamp ).toLocaleTimeString( );

const signedInText = ( signedIn: boolean ) => ( signedIn
  ? "signed in"
  : "signed out" );

const apiStatusText = ( status: FeatureFlagApiStatus ) => {
  switch ( status.state ) {
    case "loading":
      return "API: fetching…";
    case "loaded":
      return `API: fetched ${formatTime( status.fetchedAt )}, ${signedInText( status.signedIn )}`;
    case "error":
      return `API: failed ${formatTime( status.failedAt )}, ${signedInText( status.signedIn )}. `
        + "Using hard-coded defaults.";
    default:
      return "API: not fetched";
  }
};

const apiValueText = ( apiValue: boolean | undefined, status: FeatureFlagApiStatus ) => {
  if ( apiValue !== undefined ) return onOff( apiValue );
  if ( status.state === "loaded" ) return "not in Flipper";
  return "not fetched";
};

const DetailRow = ( { label, value }: { label: string; value: string } ) => (
  <View className="flex-row mb-1">
    <Body3 className="w-[150px]">{label}</Body3>
    <Body3>{value}</Body3>
  </View>
);

const FeatureFlagRow = ( { featureFlagKey }: { featureFlagKey: FeatureFlag } ) => {
  const [expanded, setExpanded] = useState( false );
  const apiStatus = useStore( state => state.featureFlagApiStatus );
  const {
    resolvedValue,
    source,
    layers,
    setOverride,
    clearOverride,
  } = useFeatureFlagForDebug( featureFlagKey );
  const name = trimFlagName( featureFlagKey );

  return (
    <View className="border-b border-lightGray py-3">
      <View className="flex-row items-center">
        <Pressable
          className="flex-1 mr-3"
          accessibilityRole="button"
          accessibilityLabel={`${name}: ${onOff( resolvedValue )}`}
          accessibilityState={{ expanded }}
          onPress={( ) => setExpanded( !expanded )}
          testID={`FeatureFlags.${featureFlagKey}`}
        >
          <Body2>
            {`${expanded
              ? "▾"
              : "▸"} ${name}`}
          </Body2>
          <Body3 className="ml-4">
            {`${onOff( resolvedValue )} · ${sourceLabels[source]}`}
          </Body3>
        </Pressable>
        <Switch
          value={resolvedValue}
          onValueChange={setOverride}
          color={colors.inatGreen}
          accessibilityLabel={`Override ${name}`}
          testID={`FeatureFlags.${featureFlagKey}.switch`}
        />
      </View>
      {expanded && (
        <View className="ml-4 mt-2">
          <CODE optionalClassName="mb-2">{featureFlagKey}</CODE>
          <DetailRow label="Hard-coded default" value={onOff( layers.hardcoded )} />
          <DetailRow label="API" value={apiValueText( layers.apiValue, apiStatus )} />
          <DetailRow
            label="Admin TestFlight"
            value={layers.adminTestFlight
              ? "ON"
              : "—"}
          />
          <DetailRow
            label="Local override"
            value={layers.override === null
              ? "none"
              : onOff( layers.override )}
          />
          {layers.override !== null && (
            <Button
              text="CLEAR OVERRIDE"
              onPress={clearOverride}
              className="mt-2"
            />
          )}
        </View>
      )}
    </View>
  );
};

const FeatureFlags = () => {
  const featureFlagKeys = Object.values( FeatureFlag );
  const apiStatus = useStore( state => state.featureFlagApiStatus );
  const clearAllOverrides = useStore( state => state.clearFeatureFlagDebugOverrides );
  return (
    <>
      <H1>Feature Flags</H1>
      <P>{apiStatusText( apiStatus )}</P>
      <P>Toggling a flag sets a local override. Overrides reset on app start.</P>
      {featureFlagKeys.map( featureFlagKey => (
        <FeatureFlagRow key={featureFlagKey} featureFlagKey={featureFlagKey} />
      ) )}
      <Button
        text="REFETCH FLAGS"
        onPress={syncFeatureFlags}
        disabled={apiStatus.state === "loading"}
        className="mt-3"
      />
      <Button
        text="CLEAR ALL OVERRIDES"
        onPress={clearAllOverrides}
        className="mt-3"
      />
    </>
  );
};

export default FeatureFlags;
