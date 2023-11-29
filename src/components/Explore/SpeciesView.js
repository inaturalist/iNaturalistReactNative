// @flow

import { fetchSpeciesCounts } from "api/observations";
import type { Node } from "react";
import React, { useCallback, useEffect, useMemo } from "react";
import Taxon from "realmModels/Taxon";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import {
  useDeviceOrientation, useInfiniteScroll, useTranslation
} from "sharedHooks";

import ExploreFlashList from "./ExploreFlashList";
import TaxonGridItem from "./TaxonGridItem";

const GUTTER = 15;

type Props = {
  handleScroll: Function,
  isOnline: boolean,
  queryParams: Object,
  setHeaderRight: Function
}

const SpeciesView = ( {
  handleScroll,
  isOnline,
  queryParams,
  setHeaderRight
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
  const { t } = useTranslation( );
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

  const contentContainerStyle = useMemo( ( ) => ( {
    paddingLeft: GUTTER / 2,
    paddingRight: GUTTER / 2
  } ), [] );

  const renderItemSeparator = useCallback( ( ) => null, [] );

  return (
    <ExploreFlashList
      contentContainerStyle={contentContainerStyle}
      data={data}
      estimatedItemSize={gridItemWidth}
      fetchNextPage={fetchNextPage}
      handleScroll={handleScroll}
      hideLoadingWheel={!isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isOnline={isOnline}
      keyExtractor={item => item.taxon.id}
      layout="grid"
      numColumns={numColumns}
      renderItem={renderItem}
      renderItemSeparator={renderItemSeparator}
      status={status}
      testID="ExploreSpeciesAnimatedList"
    />
  );
};

export default SpeciesView;
