// @flow

import {
  BottomSheet,
  Button,
  ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform } from "react-native";
import { useDeviceOrientation, useTranslation } from "sharedHooks";

import Header from "./Header";
import IdentifiersView from "./IdentifiersView";
import ObservationsView from "./ObservationsView";
import ObservationsViewBar from "./ObservationsViewBar";
import ObserversView from "./ObserversView";
import SpeciesView from "./SpeciesView";

const { diffClamp } = Animated;

type Props = {
  exploreParams: Object,
  region: Object,
  exploreView: string,
  changeExploreView: Function
}

const Explore = ( {
  exploreParams,
  region,
  exploreView,
  changeExploreView
}: Props ): Node => {
  const {
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );
  const { t } = useTranslation( );
  const [showExploreBottomSheet, setShowExploreBottomSheet] = useState( false );
  const [headerRight, setHeaderRight] = useState( null );
  const [observationsView, setObservationsView] = useState( "map" );

  const [heightAboveFilters, setHeightAboveFilters] = useState( 0 );

  const [hideHeaderCard, setHideHeaderCard] = useState( false );
  const [yValue, setYValue] = useState( 0 );
  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );

  // On Android, the scroll view offset is a double (not an integer), and interpolation shouldn't be
  // one-to-one, which causes a jittery header while slow scrolling (see issue #634).
  // See here as well: https://stackoverflow.com/a/60898411/1233767
  const scrollYClamped = diffClamp(
    scrollY.current,
    0,
    heightAboveFilters * 2
  );

  // Same as comment above (see here: https://stackoverflow.com/a/60898411/1233767)
  const offsetForHeader = scrollYClamped.interpolate( {
    inputRange: [0, heightAboveFilters * 2],
    // $FlowIgnore
    outputRange: [0, -heightAboveFilters]
  } );

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

  return (
    <>
      <ViewWrapper testID="Explore">
        <View className="overflow-hidden">
          {exploreView === "observations" && (
            <ObservationsViewBar
              observationsView={observationsView}
              updateObservationsView={newView => setObservationsView( newView )}
            />
          )}
          <Animated.View
            style={[
              {
                transform: [{ translateY: offsetForHeader }],
                height: isTablet
                  ? screenHeight
                  : Math.max( screenWidth, screenHeight )
              }
            ]}
          >
            <Header
              region={region}
              setShowExploreBottomSheet={setShowExploreBottomSheet}
              exploreViewButtonText={exploreViewText[exploreView]}
              headerRight={headerRight}
              setHeightAboveFilters={setHeightAboveFilters}
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
                setHeaderRight={setHeaderRight}
                handleScroll={handleScroll}
              />
            )}
            {exploreView === "observers" && (
              <ObserversView
                setHeaderRight={setHeaderRight}
                handleScroll={handleScroll}
              />
            )}
            {exploreView === "identifiers" && (
              <IdentifiersView
                setHeaderRight={setHeaderRight}
                handleScroll={handleScroll}
              />
            )}

          </Animated.View>
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
