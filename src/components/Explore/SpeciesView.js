// @flow

import { fetchSpeciesCounts } from "api/observations";
import TaxonGridItem from "components/Explore/TaxonGridItem.tsx";
import _ from "lodash";
import type { Node } from "react";
import React, { useEffect, useMemo, useState } from "react";
import Taxon from "realmModels/Taxon";
import { BREAKPOINTS } from "sharedHelpers/breakpoint";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useDeviceOrientation,
  useInfiniteScroll
} from "sharedHooks";

import ExploreFlashList from "./ExploreFlashList";

const GUTTER = 15;

type Props = {
  count: Object,
  isConnected: boolean,
  queryParams: Object,
  updateCount: Function,
  setCurrentExploreView: Function
}

const SpeciesView = ( {
  count,
  isConnected,
  queryParams,
  updateCount,
  setCurrentExploreView
}: Props ): Node => {
  const [observedTaxonIds, setObservedTaxonIds] = useState( new Set( ) );
  const currentUser = useCurrentUser( );
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
        taxon: Taxon.SCORE_IMAGE_FIELDS
      }
    }
  );

  const taxonIds = data.map( r => r.taxon.id );

  const { data: seenByCurrentUser } = useAuthenticatedQuery(
    ["fetchSpeciesCounts", taxonIds],
    ( ) => fetchSpeciesCounts( {
      user_id: currentUser?.id,
      taxon_id: taxonIds,
      fields: {
        taxon: {
          id: true
        }
      }
    } ),
    {
      enabled: !!( taxonIds.length > 0 && currentUser )
    }
  );

  const pageObservedTaxonIds = useMemo( ( ) => seenByCurrentUser?.results?.map(
    r => r.taxon.id
  ) || [], [seenByCurrentUser?.results] );

  useEffect( ( ) => {
    if ( pageObservedTaxonIds.length > 0 ) {
      pageObservedTaxonIds.forEach( id => {
        observedTaxonIds.add( id );
      } );
      setObservedTaxonIds( observedTaxonIds );
    }
  }, [pageObservedTaxonIds, observedTaxonIds] );

  const renderItem = ( { item } ) => (
    <TaxonGridItem
      setCurrentExploreView={setCurrentExploreView}
      count={item?.count}
      style={{
        height: gridItemWidth,
        width: gridItemWidth,
        margin: GUTTER / 2
      }}
      taxon={item?.taxon}
      showSpeciesSeenCheckmark={observedTaxonIds.has( item?.taxon.id )}
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
      isConnected={isConnected}
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
