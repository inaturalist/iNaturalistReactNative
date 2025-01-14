// @flow

import { fetchSpeciesCounts } from "api/observations";
import ExploreTaxonGridItem from "components/Explore/ExploreTaxonGridItem.tsx";
import _ from "lodash";
import {
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useEffect, useMemo, useState } from "react";
import Taxon from "realmModels/Taxon";
import {
  useCurrentUser,
  useGridLayout,
  useInfiniteScroll,
  useQuery
} from "sharedHooks";

import ExploreFlashList from "./ExploreFlashList";

type Props = {
  canFetch?: boolean,
  isConnected: boolean,
  queryParams: Object,
  setCurrentExploreView: Function,
  handleUpdateCount: Function
}

const SpeciesView = ( {
  canFetch,
  isConnected,
  queryParams,
  setCurrentExploreView,
  handleUpdateCount
}: Props ): Node => {
  // 20240814 - amanda: not sure if we actually need observedTaxonIds in state in the long
  // run, but for now, it prevents flickering when a user scrolls and new species are loaded
  // on screen
  const [observedTaxonIds, setObservedTaxonIds] = useState( new Set( ) );
  const currentUser = useCurrentUser( );
  const { state } = useExplore();
  const { excludeUser } = state;
  const {
    estimatedGridItemSize,
    flashListStyle,
    gridItemStyle,
    numColumns
  } = useGridLayout( );

  // query all of current users seen species if "not by me" explore filter
  const { data: seenByCurrentUserAll } = useQuery(
    ["fetchSpeciesCountsAll"],
    ( ) => fetchSpeciesCounts( {
      user_id: currentUser?.id,
      ttl: -1,
      fields: {
        taxon: {
          id: true
        }
      }
    } ),
    {
      enabled: ( !!currentUser && !!excludeUser )
    }
  );

  const pageObservedTaxonIdsAll = useMemo( ( ) => seenByCurrentUserAll?.results?.map(
    r => r.taxon.id
  ) || [], [seenByCurrentUserAll?.results] );

  const params = excludeUser
    ? { ...queryParams, without_taxon_id: pageObservedTaxonIdsAll }
    : queryParams;

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    totalResults
  } = useInfiniteScroll(
    "fetchSpeciesCounts",
    fetchSpeciesCounts,
    {
      ...params,
      fields: {
        taxon: Taxon.LIMITED_TAXON_FIELDS
      }
    },
    {
      enabled: canFetch
    }
  );

  const taxonIds = data.map( r => r.taxon.id );

  const { data: seenByCurrentUser } = useQuery(
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
    <ExploreTaxonGridItem
      setCurrentExploreView={setCurrentExploreView}
      count={item?.count}
      style={gridItemStyle}
      taxon={item?.taxon}
      showSpeciesSeenCheckmark={observedTaxonIds.has( item?.taxon.id )}
    />
  );
  useEffect( ( ) => {
    handleUpdateCount( "species", totalResults );
  }, [handleUpdateCount, totalResults] );

  const contentContainerStyle = useMemo( ( ) => ( {
    ...flashListStyle,
    paddingTop: 50
  } ), [flashListStyle] );

  return (
    <ExploreFlashList
      canFetch={canFetch}
      contentContainerStyle={contentContainerStyle}
      data={data}
      estimatedItemSize={estimatedGridItemSize}
      fetchNextPage={fetchNextPage}
      hideLoadingWheel={!isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isConnected={isConnected}
      keyExtractor={item => item?.taxon?.id || item}
      layout="grid"
      numColumns={numColumns}
      renderItem={renderItem}
      totalResults={totalResults}
      testID="ExploreSpeciesAnimatedList"
    />
  );
};

export default SpeciesView;
