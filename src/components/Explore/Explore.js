// @flow

import { refresh } from "@react-native-community/netinfo";
import classnames from "classnames";
import ExploreFiltersModal from "components/Explore/Modals/ExploreFiltersModal";
import {
  Body2,
  Button,
  INatIconButton,
  OfflineNotice,
  RadioButtonSheet,
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import { PLACE_MODE } from "providers/ExploreContext";
import type { Node } from "react";
import React, { useState } from "react";
import { Alert } from "react-native";
import {
  useDebugMode,
  useStoredLayout,
  useTranslation,
} from "sharedHooks";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

import ExploreHeader from "./Header/ExploreHeader";
import IdentifiersView from "./IdentifiersView";
import ObservationsView from "./ObservationsView";
import ObservationsViewBar from "./ObservationsViewBar";
import ObserversView from "./ObserversView";
import SpeciesView from "./SpeciesView";

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
} );

const exploreViewIcon = {
  observations: "binoculars",
  species: "leaf",
  observers: "observers",
  identifiers: "identifiers",
};

type Props = {
  canFetch?: boolean, // TODO: change to PLACE_MODE in Typescript
  closeFiltersModal: Function,
  count: Object,
  currentExploreView: string,
  filterByIconicTaxonUnknown: Function,
  handleUpdateCount: Function,
  hasLocationPermissions?: boolean,
  hideBackButton: boolean,
  isConnected: boolean,
  isFetchingHeaderCount: boolean,
  openFiltersModal: Function,
  placeMode: string,
  queryParams: Object,
  renderLocationPermissionsGate: Function,
  requestLocationPermissions: Function,
  setCurrentExploreView: Function,
  showFiltersModal: boolean,
  startFetching: Function,
  updateLocation: Function,
  updateProject: Function,
  updateTaxon: Function,
  updateUser: Function
}

const Explore = ( {
  canFetch,
  closeFiltersModal,
  count,
  currentExploreView,
  filterByIconicTaxonUnknown,
  handleUpdateCount,
  hasLocationPermissions,
  hideBackButton,
  isConnected,
  isFetchingHeaderCount,
  openFiltersModal,
  placeMode,
  queryParams,
  renderLocationPermissionsGate,
  requestLocationPermissions,
  setCurrentExploreView,
  showFiltersModal,
  startFetching,
  updateLocation,
  updateProject,
  updateTaxon,
  updateUser,
}: Props ): Node => {
  const { t } = useTranslation( );
  const [showExploreBottomSheet, setShowExploreBottomSheet] = useState( false );
  const { layout, writeLayoutToStorage } = useStoredLayout( "exploreObservationsLayout" );
  const { isDebug } = useDebugMode( );

  const exploreViewA11yLabel = {
    observations: t( "Observations-View" ),
    species: t( "Species-View" ),
    observers: t( "Observers-View" ),
    identifiers: t( "Identifiers-View" ),
  };

  const icon = exploreViewIcon[currentExploreView];
  const a11yLabel = exploreViewA11yLabel[currentExploreView];
  const headerCount = count[currentExploreView];

  const renderHeader = ( ) => (
    <ExploreHeader
      count={headerCount}
      exploreView={currentExploreView}
      exploreViewIcon={icon}
      hasLocationPermissions={hasLocationPermissions}
      hideBackButton={hideBackButton}
      isFetchingHeaderCount={isFetchingHeaderCount}
      onPressCount={( ) => setShowExploreBottomSheet( true )}
      openFiltersModal={openFiltersModal}
      renderLocationPermissionsGate={renderLocationPermissionsGate}
      requestLocationPermissions={requestLocationPermissions}
      updateLocation={updateLocation}
      updateTaxon={updateTaxon}
    />
  );

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

  const renderSheet = () => {
    if ( !showExploreBottomSheet ) {
      return null;
    }
    const values = {
      species: {
        label: t( "Species" ),
        text: t( "Organisms-that-are-identified-to-species" ),
        buttonText: t( "EXPLORE-SPECIES" ),
        icon: "species",
        value: "species",
      },
      observations: {
        label: t( "Observations" ),
        text: t( "Individual-encounters-with-organisms" ),
        buttonText: t( "EXPLORE-OBSERVATIONS" ),
        icon: "observations",
        value: "observations",
      },
      observers: {
        label: t( "Observers" ),
        text: t( "iNaturalist-users-who-have-observed" ),
        buttonText: t( "EXPLORE-OBSERVERS" ),
        icon: "observers",
        value: "observers",
      },
      identifiers: {
        label: t( "Identifiers" ),
        text: t( "iNaturalist-users-who-have-left-an-identification" ),
        buttonText: t( "EXPLORE-IDENTIFIERS" ),
        icon: "identifiers",
        value: "identifiers",
      },
    };

    return (
      <RadioButtonSheet
        onPressClose={() => setShowExploreBottomSheet( false )}
        headerText={t( "EXPLORE" )}
        hidden={!showExploreBottomSheet}
        confirm={newView => {
          startFetching( );
          setCurrentExploreView( newView );
          setShowExploreBottomSheet( false );
        }}
        radioValues={values}
        selectedValue={currentExploreView}
        testID="ExploreObsViewSheet"
      />
    );
  };

  const whiteCircleClass = "bg-white rounded-full h-[55px] w-[55px] border-[1px] border-lightGray";

  return (
    <>
      <ViewWrapper testID="Explore" wrapperClassName="overflow-hidden">
        <View className="flex-1 overflow-hidden">
          {renderHeader()}
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
                "z-10",
              )}
              color="white"
              size={27}
              style={[
                DROP_SHADOW,
                // eslint-disable-next-line react-native/no-inline-styles
                { backgroundColor: "deeppink" },
              ]}
              accessibilityLabel="Diagnostics"
              onPress={() => {
                Alert.alert(
                  "Explore Info",
                  `queryParams: ${JSON.stringify( queryParams )}`,
                );
              }}
            />
          )}
          <INatIconButton
            icon={icon}
            color={colors.inatGreen}
            size={27}
            className={classnames(
              whiteCircleClass,
              "absolute bottom-5 z-10 right-5",
            )}
            accessibilityLabel={a11yLabel}
            onPress={() => setShowExploreBottomSheet( true )}
            style={DROP_SHADOW}
          />
        </View>
      </ViewWrapper>
      <ExploreFiltersModal
        showModal={showFiltersModal}
        closeModal={closeFiltersModal}
        filterByIconicTaxonUnknown={filterByIconicTaxonUnknown}
        renderLocationPermissionsGate={renderLocationPermissionsGate}
        requestLocationPermissions={requestLocationPermissions}
        updateTaxon={updateTaxon}
        updateLocation={updateLocation}
        updateUser={updateUser}
        updateProject={updateProject}
      />
      {renderSheet()}
    </>
  );
};

export default Explore;
