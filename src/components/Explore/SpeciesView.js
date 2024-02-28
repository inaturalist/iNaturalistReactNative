// @flow

import { fetchSpeciesCounts } from "api/observations";
import type { Node } from "react";
import React, { useEffect, useMemo } from "react";
import Taxon from "realmModels/Taxon";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import {
  useDeviceOrientation, useInfiniteScroll
} from "sharedHooks";

import ExploreFlashList from "./ExploreFlashList";
import TaxonGridItem from "./TaxonGridItem";

const GUTTER = 15;

type Props = {
  count: Object,
  isOnline: boolean,
  queryParams: Object,
  updateCount: Function
}

const SpeciesView = ( {
  count,
  isOnline,
  queryParams,
  updateCount
}: Props ): Node => {
  const {
    isLandscapeMode,
    isTablet,
    screenHeight,
    screenWidth
  } = useDeviceOrientation( );

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

  const numColumns = calculateNumColumns( );
  const gridItemWidth = calculateGridItemWidth( numColumns );
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    totalResults,
    status
  } = useInfiniteScroll(
    "fetchSpeciesCounts",
    fetchSpeciesCounts,
    {
      ...queryParams,
      fields: {
        taxon: Taxon.TAXON_FIELDS
      }
    }
  );

  const renderItem = ( { item } ) => (
    <TaxonGridItem
      taxon={item?.taxon}
      style={{
        height: gridItemWidth,
        width: gridItemWidth,
        margin: GUTTER / 2
      }}
    />
  );
  useEffect( ( ) => {
    if ( totalResults && count.species !== totalResults ) {
      updateCount( { species: totalResults } );
    }
  }, [totalResults, updateCount, count] );

  const contentContainerStyle = useMemo( ( ) => ( {
    paddingLeft: GUTTER / 2,
    paddingRight: GUTTER / 2,
    paddingTop: 50
  } ), [] );

  return (
    <ExploreFlashList
      contentContainerStyle={contentContainerStyle}
      data={data}
      estimatedItemSize={gridItemWidth}
      fetchNextPage={fetchNextPage}
      hideLoadingWheel={!isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isOnline={isOnline}
      keyExtractor={item => item?.taxon?.id || item}
      layout="grid"
      numColumns={numColumns}
      renderItem={renderItem}
      status={status}
      testID="ExploreSpeciesAnimatedList"
    />
  );
};

export default SpeciesView;
