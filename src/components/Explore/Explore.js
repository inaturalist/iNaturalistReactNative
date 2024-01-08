// @flow

import {
  BottomSheet,
  Button,
  StickyView,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform } from "react-native";
import { useTranslation } from "sharedHooks";

import Header from "./Header";
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
  updateTaxonName: Function
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
  updateTaxonName
}: Props ): Node => {
  const { t } = useTranslation( );
  const [showExploreBottomSheet, setShowExploreBottomSheet] = useState( false );
  const [headerRight, setHeaderRight] = useState( null );
  const [observationsView, setObservationsView] = useState( "list" );

  const [heightAboveFilters, setHeightAboveFilters] = useState( 0 );

  const [hideHeaderCard, setHideHeaderCard] = useState( false );
  const [yValue, setYValue] = useState( 0 );
  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );

  const exploreViewText = {
    observations: t( "OBSERVATIONS" ),
    species: t( "SPECIES" ),
    observers: t( "OBSERVERS" ),
    identifiers: t( "IDENTIFIERS" )
  };

  useEffect( ( ) => {
    if ( exploreView === "observations" ) {
      setHeaderRight( null );
    }
  }, [exploreView] );

  const handleScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: { y: scrollY.current }
        }
      }
    ],
    {
      listener: ( { nativeEvent } ) => {
        const { y } = nativeEvent.contentOffset;
        const hide = yValue < y;
        // there's likely a better way to do this, but for now fading out
        // the content that goes under the status bar / safe area notch on iOS
        if ( Platform.OS !== "ios" ) { return; }
        if ( hide !== hideHeaderCard ) {
          setHideHeaderCard( hide );
          setYValue( y );
        }
      },
      useNativeDriver: true
    }
  );

  const queryParams = { ...exploreParams };
  delete queryParams.taxon_name;

  return (
    <>
      <ViewWrapper testID="Explore">
        {exploreView === "observations" && (
          <ObservationsViewBar
            observationsView={observationsView}
            updateObservationsView={newView => setObservationsView( newView )}
          />
        )}
        <View className="overflow-hidden">
          <StickyView scrollY={scrollY} heightAboveView={heightAboveFilters}>
            <Header
              region={region}
              setShowExploreBottomSheet={setShowExploreBottomSheet}
              exploreViewButtonText={exploreViewText[exploreView]}
              headerRight={headerRight}
              setHeightAboveFilters={setHeightAboveFilters}
              updateTaxon={updateTaxon}
              updatePlace={updatePlace}
              updatePlaceName={updatePlaceName}
              exploreParams={exploreParams}
              updateTaxonName={updateTaxonName}
            />
            {exploreView === "observations" && (
              <ObservationsView
                region={region}
                exploreParams={exploreParams}
                handleScroll={handleScroll}
                observationsView={observationsView}
              />
            )}
            {exploreView === "species" && (
              <SpeciesView
                handleScroll={handleScroll}
                isOnline={isOnline}
                setHeaderRight={setHeaderRight}
                queryParams={queryParams}
              />
            )}
            {exploreView === "observers" && (
              <ObserversView
                handleScroll={handleScroll}
                isOnline={isOnline}
                setHeaderRight={setHeaderRight}
                queryParams={queryParams}
              />
            )}
            {exploreView === "identifiers" && (
              <IdentifiersView
                handleScroll={handleScroll}
                isOnline={isOnline}
                setHeaderRight={setHeaderRight}
                queryParams={queryParams}
              />
            )}
          </StickyView>
        </View>
      </ViewWrapper>
      {showExploreBottomSheet && (
        <BottomSheet
          headerText={t( "EXPLORE" )}
        >
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
    </>
  );
};

export default Explore;
