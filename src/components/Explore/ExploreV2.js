// @flow

import { refresh } from "@react-native-community/netinfo";
import classnames from "classnames";
import {
  Body2,
  Button,
  INatIconButton,
  OfflineNotice,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { PLACE_MODE } from "providers/ExploreContext";
import type { Node } from "react";
import React from "react";
import { Alert } from "react-native";
import {
  useDebugMode,
  useStoredLayout,
  useTranslation
} from "sharedHooks";
import { getShadow } from "styles/global";

import IdentifiersView from "./IdentifiersView";
import ObservationsView from "./ObservationsView";
import ObservationsViewBar from "./ObservationsViewBar";
import ObserversView from "./ObserversView";
import SpeciesView from "./SpeciesView";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6
} );

type Props = {
  canFetch?: boolean, // TODO: change to PLACE_MODE in Typescript
  currentExploreView: string,
  handleUpdateCount: Function,
  hasLocationPermissions?: boolean,
  isConnected: boolean,
  placeMode: string,
  queryParams: Object,
  renderLocationPermissionsGate: Function,
  requestLocationPermissions: Function,
}

const ExploreV2 = ( {
  canFetch,
  currentExploreView,
  handleUpdateCount,
  hasLocationPermissions,
  isConnected,
  placeMode,
  queryParams,
  renderLocationPermissionsGate,
  requestLocationPermissions
}: Props ): Node => {
  const { t } = useTranslation( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "exploreObservationsLayout" );
  const { isDebug } = useDebugMode( );

  const renderMainContent = ( ) => {
    if ( isConnected === false ) {
      return (
        <OfflineNotice
          onPress={() => refresh()}
        />
      );
    }
    // hasLocationPermissions === undefined means we haven't checked for location permissions yet
    if ( placeMode === PLACE_MODE.NEARBY && hasLocationPermissions === false ) {
      return (
        <View className="flex-1 justify-center p-4">
          <View className="items-center">
            <Body2>{t( "To-view-nearby-organisms-please-enable-location" )}</Body2>
          </View>
          <Button
            className="mt-5"
            text={t( "ALLOW-LOCATION-ACCESS" )}
            accessibilityHint={t( "Opens-location-permission-prompt" )}
            level="focus"
            onPress={( ) => requestLocationPermissions()}
          />
        </View>
      );
    }
    return (
      <View className="flex-1">
        {currentExploreView === "observations" && (
          <ObservationsView
            canFetch={canFetch}
            layout={layout}
            queryParams={queryParams}
            handleUpdateCount={handleUpdateCount}
            hasLocationPermissions={hasLocationPermissions}
            renderLocationPermissionsGate={renderLocationPermissionsGate}
            requestLocationPermissions={requestLocationPermissions}
          />
        )}
        {currentExploreView === "species" && (
          <SpeciesView
            canFetch={canFetch}
            isConnected={isConnected}
            queryParams={queryParams}
            handleUpdateCount={handleUpdateCount}
          />
        )}
        {currentExploreView === "observers" && (
          <ObserversView
            canFetch={canFetch}
            isConnected={isConnected}
            queryParams={queryParams}
            handleUpdateCount={handleUpdateCount}
          />
        )}
        {currentExploreView === "identifiers" && (
          <IdentifiersView
            canFetch={canFetch}
            isConnected={isConnected}
            queryParams={queryParams}
            handleUpdateCount={handleUpdateCount}
          />
        )}
      </View>
    );
  };

  return (
    <>
      <ViewWrapper testID="ExploreV2" wrapperClassName="overflow-hidden">
        <View className="flex-1 overflow-hidden">
          {currentExploreView === "observations" && (
            <ObservationsViewBar
              layout={layout}
              updateObservationsView={writeLayoutToStorage}
            />
          )}
          {renderMainContent()}
          {isDebug && (
            <INatIconButton
              icon="triangle-exclamation"
              className={classnames(
                "absolute",
                "bg-white",
                "bottom-[100px]",
                "h-[55px]",
                "right-5",
                "rounded-full",
                "w-[55px]",
                "z-10"
              )}
              color="white"
              size={27}
              style={[
                DROP_SHADOW,
                // eslint-disable-next-line react-native/no-inline-styles
                { backgroundColor: "deeppink" }
              ]}
              accessibilityLabel="Diagnostics"
              onPress={() => {
                Alert.alert(
                  "ExploreV2 Info",
                  `queryParams: ${JSON.stringify( queryParams )}`
                );
              }}
            />
          )}
        </View>
      </ViewWrapper>
      {/*
        Leaving this here so that it is easier to reason about differences between Explore
        and ExploreRedesign.
      */}
      {null}
    </>
  );
};

export default ExploreV2;
