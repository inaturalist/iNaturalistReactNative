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
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { Alert } from "react-native";
import { useTheme } from "react-native-paper";
import {
  useDebugMode,
  useStoredLayout,
  useTranslation
} from "sharedHooks";
import { getShadowForColor } from "styles/global";
import colors from "styles/tailwindColors";

import Header from "./Header/Header";
import useCurrentExploreView from "./hooks/useCurrentExploreView";
import IdentifiersView from "./IdentifiersView";
import ObservationsView from "./ObservationsView";
import ObservationsViewBar from "./ObservationsViewBar";
import ObserversView from "./ObserversView";
import SpeciesView from "./SpeciesView";

const DROP_SHADOW = getShadowForColor( colors.darkGray, {
  offsetHeight: 4,
  elevation: 6
} );

const exploreViewIcon = {
  observations: "binoculars",
  species: "leaf",
  observers: "observers",
  identifiers: "identifiers"
};

type Props = {
  closeFiltersModal: Function,
  count: Object,
  filterByIconicTaxonUnknown: Function,
  hideBackButton: boolean,
  isOnline: boolean,
  loadingStatus: boolean,
  openFiltersModal: Function,
  queryParams: Object,
  showFiltersModal: boolean,
  updateCount: Function,
  updateTaxon: Function,
  updateLocation: Function,
  updateUser: Function,
  updateProject: Function,
  hasLocationPermissions: ?boolean
}

const Explore = ( {
  closeFiltersModal,
  count,
  filterByIconicTaxonUnknown,
  hideBackButton,
  isOnline,
  loadingStatus,
  openFiltersModal,
  queryParams,
  showFiltersModal,
  updateCount,
  updateTaxon,
  updateLocation,
  updateUser,
  updateProject,
  hasLocationPermissions
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );
  const [showExploreBottomSheet, setShowExploreBottomSheet] = useState( false );
  const { layout, writeLayoutToStorage } = useStoredLayout( "exploreObservationsLayout" );
  const { isDebug } = useDebugMode( );
  const { currentExploreView, setCurrentExploreView } = useCurrentExploreView( );

  const exploreViewA11yLabel = {
    observations: t( "Observations-View" ),
    species: t( "Species-View" ),
    observers: t( "Observers-View" ),
    identifiers: t( "Identifiers-View" )
  };

  const icon = exploreViewIcon[currentExploreView];
  const a11yLabel = exploreViewA11yLabel[currentExploreView];
  const headerCount = count[currentExploreView];

  const renderHeader = ( ) => (
    <Header
      count={headerCount}
      exploreView={currentExploreView}
      exploreViewIcon={icon}
      hideBackButton={hideBackButton}
      loadingStatus={loadingStatus}
      openFiltersModal={openFiltersModal}
      updateTaxon={updateTaxon}
      updateLocation={updateLocation}
      onPressCount={( ) => setShowExploreBottomSheet( true )}
    />
  );

  const renderMainContent = ( ) => {
    if ( !isOnline ) {
      return (
        <OfflineNotice
          onPress={() => refresh()}
        />
      );
    }
    // Undefined means we haven't checked for location permissions yet
    if ( hasLocationPermissions === false ) {
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
            onPress={( ) => console.log( "press" )}
          />
        </View>
      );
    }
    return (
      <View className="flex-1">
        {currentExploreView === "observations" && (
          <ObservationsView
            count={count}
            layout={layout}
            queryParams={queryParams}
            updateCount={updateCount}
          />
        )}
        {currentExploreView === "species" && (
          <SpeciesView
            count={count}
            isOnline={isOnline}
            queryParams={queryParams}
            updateCount={updateCount}
          />
        )}
        {currentExploreView === "observers" && (
          <ObserversView
            count={count}
            isOnline={isOnline}
            queryParams={queryParams}
            updateCount={updateCount}
          />
        )}
        {currentExploreView === "identifiers" && (
          <IdentifiersView
            count={count}
            isOnline={isOnline}
            queryParams={queryParams}
            updateCount={updateCount}
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
        value: "species"
      },
      observations: {
        label: t( "Observations" ),
        text: t( "Individual-encounters-with-organisms" ),
        buttonText: t( "EXPLORE-OBSERVATIONS" ),
        icon: "observations",
        value: "observations"
      },
      observers: {
        label: t( "Observers" ),
        text: t( "iNaturalist-users-who-have-observed" ),
        buttonText: t( "EXPLORE-OBSERVERS" ),
        icon: "observers",
        value: "observers"
      },
      identifiers: {
        label: t( "Identifiers" ),
        text: t( "iNaturalist-users-who-have-left-an-identification" ),
        buttonText: t( "EXPLORE-IDENTIFIERS" ),
        icon: "identifiers",
        value: "identifiers"
      }
    };

    return (
      <RadioButtonSheet
        handleClose={() => setShowExploreBottomSheet( false )}
        headerText={t( "EXPLORE" )}
        hidden={!showExploreBottomSheet}
        confirm={newView => {
          setCurrentExploreView( newView );
          setShowExploreBottomSheet( false );
        }}
        radioValues={values}
        selectedValue={currentExploreView}
      />
    );
  };

  const grayCircleClass = "bg-darkGray rounded-full h-[55px] w-[55px]";

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
                  "Explore Info",
                  `queryParams: ${JSON.stringify( queryParams )}`
                );
              }}
            />
          )}
          <INatIconButton
            icon={icon}
            color={theme.colors.onPrimary}
            size={27}
            className={classnames(
              grayCircleClass,
              "absolute bottom-5 z-10 right-5"
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
