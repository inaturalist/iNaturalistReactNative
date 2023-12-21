// @flow

import { searchObservations } from "api/observations";
import classnames from "classnames";
import {
  BottomSheet,
  Button,
  INatIconButton,
  ViewWrapper
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "react-native-paper";
import {
  useAuthenticatedQuery, useTranslation
} from "sharedHooks";

import ExploreFilters from "./ExploreFilters";
import Header from "./Header/Header";
import IdentifiersView from "./IdentifiersView";
import ObservationsView from "./ObservationsView";
import ObservationsViewBar from "./ObservationsViewBar";
import ObserversView from "./ObserversView";
import SpeciesView from "./SpeciesView";

type Props = {
  changeExploreView: Function,
  exploreParams: Object,
  exploreView: string,
  isOnline: boolean,
  region: Object,
  updateTaxon: Function,
  updatePlace: Function,
  updatePlaceName: Function,
  updateTaxonName: Function,
  filtersNotDefault: boolean,
  resetFilters: Function,
  updateSortBy: Function,
  showFiltersModal: boolean,
  openFiltersModal: Function,
  closeFiltersModal: Function,
  numberOfFilters: number,
  updateResearchGrade: Function,
  updateNeedsID: Function,
  updateCasual: Function,
  updateHighestTaxonomicRank: Function,
  updateLowestTaxonomicRank: Function,
  updateDateObserved: Function,
  updateDateUploaded: Function,
  updateMedia: Function
}

const Explore = ( {
  changeExploreView,
  exploreParams,
  exploreView,
  isOnline,
  region,
  updateTaxon,
  updatePlace,
  updatePlaceName,
  updateTaxonName,
  filtersNotDefault,
  resetFilters,
  updateSortBy,
  showFiltersModal,
  openFiltersModal,
  closeFiltersModal,
  numberOfFilters,
  updateResearchGrade,
  updateNeedsID,
  updateCasual,
  updateHighestTaxonomicRank,
  updateLowestTaxonomicRank,
  updateDateObserved,
  updateDateUploaded,
  updateMedia
}: Props ): Node => {
  const theme = useTheme( );
  const { t } = useTranslation( );
  const [showExploreBottomSheet, setShowExploreBottomSheet] = useState( false );
  const [count, setCount] = useState( {
    observations: null,
    species: null,
    observers: null,
    identifiers: null
  } );
  const [observationsView, setObservationsView] = useState( "list" );

  const updateCount = useCallback( newCount => {
    setCount( {
      ...count,
      ...newCount
    } );
  }, [count] );

  const exploreViewText = {
    observations: t( "OBSERVATIONS" ),
    species: t( "SPECIES" ),
    observers: t( "OBSERVERS" ),
    identifiers: t( "IDENTIFIERS" )
  };

  // TODO: observers and identifiers icons need replacement
  const exploreViewIcon = {
    observations: "binoculars",
    species: "leaf",
    observers: "person",
    identifiers: "person"
  };

  const queryParams = {
    ...exploreParams,
    per_page: 20
  };
  delete queryParams.taxon_name;

  const paramsTotalResults = {
    ...exploreParams,
    per_page: 0
  };

  // 011224 amanda - we might eventually want to fetch this from useInfiniteObservationsScroll
  // instead of making a separate query, but per_page = 0 should make this extra query a low
  // performance cost
  const { data } = useAuthenticatedQuery(
    ["searchObservations"],
    optsWithAuth => searchObservations( paramsTotalResults, optsWithAuth )
  );

  useEffect( ( ) => {
    if ( data?.total_results && count.observations !== data?.total_results ) {
      updateCount( { observations: data?.total_results } );
    }
  }, [data?.total_results, updateCount, count] );

  const renderHeader = ( ) => (
    <Header
      count={count[exploreView]}
      exploreParams={exploreParams}
      exploreView={exploreView}
      exploreViewIcon={exploreViewIcon[exploreView]}
      region={region}
      updatePlace={updatePlace}
      updatePlaceName={updatePlaceName}
      updateTaxon={updateTaxon}
      updateTaxonName={updateTaxonName}
    />
  );

  const grayCircleClass = "bg-darkGray rounded-full h-[55px] w-[55px]";

  return (
    <>
      <ViewWrapper testID="Explore">
        {renderHeader( )}
        {exploreView === "observations" && (
          <ObservationsViewBar
            observationsView={observationsView}
            updateObservationsView={newView => setObservationsView( newView )}
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
          onPress={( ) => setShowExploreBottomSheet( true )}
        />
        {exploreView === "observations" && (
          <ObservationsView
            exploreParams={exploreParams}
            observationsView={observationsView}
            region={region}
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
      {showExploreBottomSheet && (
        <BottomSheet headerText={t( "EXPLORE" )}>
          {Object.keys( exploreViewText ).map( view => (
            <Button
              text={exploreViewText[view]}
              key={exploreViewText[view]}
              className="mx-5 my-3"
              onPress={( ) => {
                changeExploreView( view );
                setShowExploreBottomSheet( false );
              }}
            />
          ) )}
        </BottomSheet>
      )}
      <ExploreFilters
        exploreParams={exploreParams}
        region={region}
        filtersNotDefault={filtersNotDefault}
        resetFilters={resetFilters}
        showModal={showFiltersModal}
        closeModal={closeFiltersModal}
        updateTaxon={updateTaxon}
        updateSortBy={updateSortBy}
        numberOfFilters={numberOfFilters}
        updateResearchGrade={updateResearchGrade}
        updateNeedsID={updateNeedsID}
        updateCasual={updateCasual}
        updateHighestTaxonomicRank={updateHighestTaxonomicRank}
        updateLowestTaxonomicRank={updateLowestTaxonomicRank}
        updateDateObserved={updateDateObserved}
        updateDateUploaded={updateDateUploaded}
        updateMedia={updateMedia}
      />
    </>
  );
};

export default Explore;
