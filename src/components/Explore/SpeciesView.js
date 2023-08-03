// @flow

import { FlashList } from "@shopify/flash-list";
import { fetchSpeciesCounts } from "api/observations";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { Animated } from "react-native";
import Taxon from "realmModels/Taxon";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import {
  useDeviceOrientation, useInfiniteScroll, useTranslation
} from "sharedHooks";

import TaxonGridItem from "./TaxonGridItem";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

const GUTTER = 15;

type Props = {
  testID: string,
  setHeaderRight: Function
}

const SpeciesView = ( {
  testID,
  setHeaderRight
}: Props ): Node => {
  const {
    isLandscapeMode,
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );
  const [numColumns, setNumColumns] = useState( 0 );
  const [gridItemWidth, setGridItemWidth] = useState( 0 );

  useEffect( ( ) => {
    const calculateGridItemWidth = columns => {
      const combinedGutter = ( columns + 1 ) * GUTTER;
      const gridWidth = isTablet
        ? screenWidth
        : Math.min( screenWidth, screenHeight );
      return Math.floor(
        ( gridWidth - combinedGutter ) / columns
      );
    };

    const calculateNumColumns = ( ) => {
      if ( !isTablet ) return 2;
      if ( isLandscapeMode ) return 6;
      if ( screenWidth <= BREAKPOINTS.xl ) return 2;
      return 4;
    };

    const columns = calculateNumColumns( );
    setGridItemWidth( calculateGridItemWidth( columns ) );
    setNumColumns( columns );
  }, [
    isLandscapeMode,
    isTablet,
    screenHeight,
    screenWidth
  ] );
  const { t } = useTranslation( );
  const {
    data: speciesCountList,
    isFetchingNextPage,
    fetchNextPage,
    totalResults
  } = useInfiniteScroll(
    "fetchSpeciesCounts",
    fetchSpeciesCounts,
    {
      place_id: 54321,
      fields: {
        taxon: Taxon.TAXON_FIELDS
      }
    }
  );

  const renderItem = ( { item } ) => (
    <TaxonGridItem
      taxon={item.taxon}
      style={{
        height: gridItemWidth,
        width: gridItemWidth,
        margin: GUTTER / 2
      }}
    />
  );

  useEffect( ( ) => {
    if ( totalResults ) {
      setHeaderRight( t( "X-Species", { count: totalResults } ) );
    }
  }, [totalResults, setHeaderRight, t] );

  const contentContainerStyle = {
    paddingLeft: GUTTER / 2,
    paddingRight: GUTTER / 2
  };

  const renderEmptyList = ( ) => <View />;

  const renderFooter = ( ) => (
    <InfiniteScrollLoadingWheel
      isFetchingNextPage={isFetchingNextPage}
      layout="grid"
    />
  );

  if ( !speciesCountList || speciesCountList.length === 0 ) {
    return null;
  }

  return (
    <View className="h-full mt-[180px]">
      <AnimatedFlashList
        contentContainerStyle={contentContainerStyle}
        data={speciesCountList}
        testID={testID}
        horizontal={false}
        key="grid"
        estimatedItemSize={gridItemWidth}
        keyExtractor={item => item.taxon.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderFooter}
        numColumns={numColumns}
        initialNumToRender={5}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={1}
        refreshing={isFetchingNextPage}
        accessible
      />
    </View>
  );
};

export default SpeciesView;
