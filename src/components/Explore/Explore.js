// @flow

import classnames from "classnames";
import {
  BottomSheet,
  Button,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useState } from "react";
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

  const exploreViewText = {
    observations: t( "OBSERVATIONS" ),
    species: t( "SPECIES" ),
    observers: t( "OBSERVERS" ),
    identifiers: t( "IDENTIFIERS" )
  };

  const renderHeader = ( ) => (
    <Header
      count={count[exploreView]}
      exploreView={exploreView}
      exploreViewIcon={exploreViewIcon[exploreView]}
      updateTaxon={updateTaxon}
      openFiltersModal={openFiltersModal}
    />
  );

  const grayCircleClass = "bg-darkGray rounded-full h-[55px] w-[55px]";

  return (
    <>
      {!showFiltersModal
        ? (
          <ViewWrapper testID="Explore" wrapperClassName="overflow-hidden">
            {renderHeader()}
            {exploreView === "observations" && (
              <ObservationsViewBar
                layout={layout}
                updateObservationsView={writeLayoutToStorage}
              />
            )}
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
          </ViewWrapper>
        )
        : (
          <ViewWrapper>
            <FilterModal
              closeModal={closeFiltersModal}
              updateTaxon={updateTaxon}
            />
          </ViewWrapper>
        )}
      <BottomSheet
        handleClose={( ) => setShowExploreBottomSheet( false )}
        headerText={t( "EXPLORE" )}
        hidden={!showExploreBottomSheet}
      >
        {Object.keys( exploreViewText ).map( view => (
          <Button
            className="mx-5 my-3"
            key={exploreViewText[view]}
            onPress={() => {
              changeExploreView( view );
              setShowExploreBottomSheet( false );
            }}
            text={exploreViewText[view]}
          />
        ) )}
      </BottomSheet>
    </>
  );
};

export default Explore;
