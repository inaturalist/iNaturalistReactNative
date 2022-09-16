// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import type { Node } from "react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, Text, View
} from "react-native";

import useLoggedIn from "../../../sharedHooks/useLoggedIn";
import { textStyles, viewStyles } from "../../../styles/observations/obsList";
import Map from "../Map";
import EmptyList from "./EmptyList";
import GridItem from "./GridItem";
import InfiniteScrollFooter from "./InfiniteScrollFooter";
import ObsCard from "./ObsCard";
import ObsListHeader from "./ObsListHeader";

type Props = {
  loading: boolean,
  localObservations: Object,
  testID: string,
  taxonId?: number,
  mapHeight?: number,
  totalObservations?: number,
  handleEndReached?: Function,
  syncObservations?: Function
}

const ObservationViews = ( {
  loading,
  localObservations,
  testID,
  taxonId,
  mapHeight,
  totalObservations,
  handleEndReached,
  syncObservations
}: Props ): Node => {
  const [view, setView] = useState( "list" );
  const navigation = useNavigation( );
  const { name } = useRoute( );
  const isLoggedIn = useLoggedIn( );
  const { observationList, unuploadedObsList } = localObservations;
  const numOfUnuploadedObs = unuploadedObsList?.length;
  // eslint-disable-next-line
  const [hasScrolled, setHasScrolled] = useState( false );

  const { diffClamp } = Animated;
  const headerHeight = 120;

  // basing collapsible sticky header code off the example in this article
  // https://medium.com/swlh/making-a-collapsible-sticky-header-animations-with-react-native-6ad7763875c3
  const scrollY = useRef( new Animated.Value( 0 ) );
  const scrollYClamped = diffClamp( scrollY.current, 0, headerHeight );

  const translateY = scrollYClamped.interpolate( {
    inputRange: [0, headerHeight],
    // $FlowIgnore
    outputRange: [0, -headerHeight]
  } );

  const translateYNumber = useRef();

  translateY.addListener( ( { value } ) => {
    translateYNumber.current = value;
  } );

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

        if ( y <= 0 ) {
          setHasScrolled( false );
        } else {
          setHasScrolled( true );
        }
      },
      useNativeDriver: true
    }
  );

  const navToObsDetails = async observation => {
    navigation.navigate( "ObsDetails", { observation } );
  };

  const renderItem = ( { item } ) => (
    <ObsCard item={item} handlePress={navToObsDetails} />
  );
  const renderGridItem = ( { item } ) => <GridItem item={item} handlePress={navToObsDetails} />;

  const renderEmptyState = ( ) => {
    if ( name !== "Explore" && isLoggedIn === false ) {
      return <EmptyList />;
    }
    return null;
  };

  const { t } = useTranslation( );

  const renderFooter = ( ) => {
    if ( isLoggedIn === false ) { return null; }
    return loading
      ? <InfiniteScrollFooter />
      : <View style={viewStyles.footer} />;
  };

  const isExplore = name === "Explore";

  const renderHeader = ( ) => (
    <ObsListHeader
      numOfUnuploadedObs={numOfUnuploadedObs}
      isLoggedIn={isLoggedIn}
      translateY={translateY}
      isExplore={isExplore}
      headerHeight={headerHeight}
      syncObservations={syncObservations}
      setView={setView}
    />
  );

  const renderView = ( ) => {
    if ( view === "map" ) {
      return <Map taxonId={taxonId} mapHeight={mapHeight} />;
    }
    return (
      <Animated.FlatList
        data={observationList}
        key={view === "grid" ? 1 : 0}
        renderItem={view === "grid" ? renderGridItem : renderItem}
        numColumns={view === "grid" ? 2 : 1}
        testID={testID}
        ListEmptyComponent={renderEmptyState}
        onScroll={handleScroll}
        onEndReached={handleEndReached}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        bounces={false}
      />
    );
  };

  return (
    <View testID="ObservationViews.myObservations">
      {isExplore && (
        <View style={[viewStyles.whiteBanner, view === "map" && viewStyles.greenBanner]}>
          <Text style={[textStyles.center, view === "map" && textStyles.whiteText]}>
            {t( "X-Observations", { observationCount: totalObservations } )}
          </Text>
        </View>
      )}
      {renderView( )}
    </View>
  );
};

export default ObservationViews;
