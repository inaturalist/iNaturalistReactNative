// @flow

import classnames from "classnames";
import {
  INatIconButton,
  RadioButtonSheet,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
// import { Alert } from "react-native";
import { useTheme } from "react-native-paper";
import {
  useStoredLayout,
  useTranslation
} from "sharedHooks";
import { getShadowStyle } from "styles/global";

import Header from "./Header/Header";
import IdentifiersView from "./IdentifiersView";
import FilterModal from "./Modals/FilterModal";
import ObservationsView from "./ObservationsView";
import ObservationsViewBar from "./ObservationsViewBar";
import ObserversView from "./ObserversView";
import SpeciesView from "./SpeciesView";

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 4,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 6
} );

// TODO: observers and identifiers icons need replacement
const exploreViewIcon = {
  observations: "binoculars",
  species: "leaf",
  observers: "person",
  identifiers: "person"
};

type Props = {
  changeExploreView: Function,
  closeFiltersModal: Function,
  count: Object,
  exploreView: string,
  isOnline: boolean,
  openFiltersModal: Function,
  queryParams: Object,
  showFiltersModal: boolean,
  updateCount: Function,
  updateTaxon: Function
}

const Explore = ( {
  changeExploreView,
  closeFiltersModal,
  count,
  exploreView,
  isOnline,
  openFiltersModal,
  queryParams,
  showFiltersModal,
  updateCount,
  updateTaxon
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );
  const [showExploreBottomSheet, setShowExploreBottomSheet] = useState( false );
  const { layout, writeLayoutToStorage } = useStoredLayout( "exploreObservationsLayout" );

  const renderHeader = ( ) => (
    <Header
      count={count[exploreView]}
      exploreView={exploreView}
      exploreViewIcon={exploreViewIcon[exploreView]}
      updateTaxon={updateTaxon}
      openFiltersModal={openFiltersModal}
    />
  );

  const renderSheet = () => {
    if ( !showExploreBottomSheet ) {
      return null;
    }
    const values = [
      {
        label: t( "Species" ),
        text: t( "Organisms-that-are-identified-to-species" ),
        value: "species"
      },
      {
        label: t( "Observations" ),
        text: t( "Individual-encounters-with-organisms" ),
        value: "observations"
      },
      {
        label: t( "Observers" ),
        text: t( "iNaturalist-users-who-have-observed" ),
        value: "observers"
      },
      {
        label: t( "Identifiers" ),
        text: t( "iNaturalist-users-who-have-left-an-identification" ),
        value: "identifiers"
      }
    ];

    return (
      <RadioButtonSheet
        handleClose={() => setShowExploreBottomSheet( false )}
        headerText={t( "EXPLORE" )}
        hidden={!showExploreBottomSheet}
        confirm={newView => {
          changeExploreView( newView );
          setShowExploreBottomSheet( false );
        }}
        radioValues={values}
        selectedValue={exploreView}
      />
    );
  };

  const grayCircleClass = "bg-darkGray rounded-full h-[55px] w-[55px]";

  return (
    <>
      <ViewWrapper testID="Explore" wrapperClassName="overflow-hidden">
        {renderHeader()}
        {exploreView === "observations" && (
          <ObservationsViewBar
            layout={layout}
            updateObservationsView={writeLayoutToStorage}
          />
        )}
        <View className="flex-1">
          {/* <INatIconButton
            icon="triangle-exclamation"
            className="absolute h-[55px] w-[55px] top-5 right-5 bg-white rounded-full z-10"
            color="white"
            size={27}
            style={[
              getShadow( theme.colors.primary ),
              // eslint-disable-next-line react-native/no-inline-styles
              { backgroundColor: "orange" }
            ]}
            accessibilityLabel="Diagnostics"
            onPress={( ) => {
              Alert.alert(
                "Explore Info",
                `queryParams: ${JSON.stringify( queryParams )}`
              );
            }}
          /> */}
          <INatIconButton
            icon={exploreViewIcon[exploreView]}
            color={theme.colors.onPrimary}
            size={27}
            className={classnames(
              grayCircleClass,
              "absolute bottom-5 z-10 right-5"
            )}
            accessibilityLabel={t( "Explore-View" )}
            onPress={() => setShowExploreBottomSheet( true )}
            style={getShadow( theme.colors.primary )}
          />
          {exploreView === "observations" && (
            <ObservationsView
              layout={layout}
              queryParams={queryParams}
            />
          )}
          {exploreView === "species" && (
            <SpeciesView
              count={count}
              isOnline={isOnline}
              queryParams={queryParams}
              updateCount={updateCount}
            />
          )}
          {exploreView === "observers" && (
            <ObserversView
              count={count}
              isOnline={isOnline}
              queryParams={queryParams}
              updateCount={updateCount}
            />
          )}
          {exploreView === "identifiers" && (
            <IdentifiersView
              count={count}
              isOnline={isOnline}
              queryParams={queryParams}
              updateCount={updateCount}
            />
          )}
        </View>
      </ViewWrapper>
      {showFiltersModal && (
        <ViewWrapper wrapperClassName="absolute w-full h-full overflow-hidden">
          <FilterModal
            closeModal={closeFiltersModal}
            updateTaxon={updateTaxon}
          />
        </ViewWrapper>
      )}
      {renderSheet()}
    </>
  );
};

export default Explore;
