// @flow

import { fetchSpeciesCounts } from "api/observations";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
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
  setHeaderRight: Function,
  queryParams: Object
}

const SpeciesView = ( {
  handleScroll,
  setHeaderRight,
  queryParams
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

  const contentContainerStyle = {
    paddingLeft: GUTTER / 2,
    paddingRight: GUTTER / 2
  };

  return (
    <ExploreFlashList
      contentContainerStyle={contentContainerStyle}
      testID="ExploreSpeciesAnimatedList"
      handleScroll={handleScroll}
      isFetchingNextPage={isFetchingNextPage}
      data={data}
      renderItem={renderItem}
      fetchNextPage={fetchNextPage}
      estimatedItemSize={gridItemWidth}
      keyExtractor={item => item.taxon.id}
      layout="grid"
      numColumns={numColumns}
      status={status}
    />
  );
};

export default SpeciesView;
