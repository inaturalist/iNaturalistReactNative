import { useQueries } from "@tanstack/react-query";
import { fetchSpeciesCounts } from "api/observations";
import type { ApiTaxon } from "api/types";
import ExploreFlashList from "components/Explore/ExploreFlashList";
import ExploreV2SpeciesGridItem
  from "components/Explore/ExploreV2/components/ExploreV2SpeciesGridItem";
import type { ExploreV2QueryParams } from "components/Explore/ExploreV2/helpers/buildQueryParams";
import i18n from "i18next";
import React, { useCallback, useMemo } from "react";
import Taxon from "realmModels/Taxon";
import { handleRetryDelay, reactQueryRetry } from "sharedHelpers/logging";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useGridLayout from "sharedHooks/useGridLayout";
import useInfiniteScroll from "sharedHooks/useInfiniteScroll";

export type SpeciesCountQueryParams = Omit<
  ExploreV2QueryParams,
  "order_by" | "order" | "per_page"
>;

interface SpeciesCountResult {
  count: number;
  taxon: ApiTaxon;
}

interface Props {
  enabled: boolean;
  isConnected: boolean | null;
  params: SpeciesCountQueryParams;
}

// One seen-query per infinite-scroll page: the seen-id chunks are sized to
// SPECIES_PAGE_SIZE so each chunk aligns to exactly one loaded page
const SPECIES_PAGE_SIZE = 10;

const ExploreV2SpeciesView = ( { enabled, isConnected, params }: Props ) => {
  const currentUser = useCurrentUser( );
  const { flashListStyle, gridItemStyle, numColumns } = useGridLayout( );

  // Signed-out users have no account locale, so common names need the app
  // language passed explicitly
  const locale = i18n?.language ?? "en";

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    totalResults,
  } = useInfiniteScroll(
    "exploreV2SpeciesCounts",
    fetchSpeciesCounts,
    {
      ...params,
      per_page: SPECIES_PAGE_SIZE,
      ...( !currentUser && { locale } ),
      fields: {
        taxon: Taxon.LIMITED_TAXON_FIELDS,
      },
    },
    { enabled },
  );

  const taxonIds = ( data as SpeciesCountResult[] ).map( r => r.taxon.id as number );

  // taxonIdChunks holds the cumulative list of all taxa viewed, sliced into groups of 10.
  const taxonIdChunks: number[][] = [];
  for ( let i = 0; i < taxonIds.length; i += SPECIES_PAGE_SIZE ) {
    taxonIdChunks.push( taxonIds.slice( i, i + SPECIES_PAGE_SIZE ) );
  }

  // useQueries executes taxonIdChunks.length queries,
  // relying on React Query's caching so each full chunk actually runs only once
  // TODO split out a shared useQueries wrapper if multiple use sites become necessary
  const observedIds = useQueries( {
    queries: taxonIdChunks.map( chunk => ( {
      queryKey: ["exploreV2SpeciesCountsSeen", currentUser?.id, chunk.join( "," )],
      queryFn: ( ) => fetchSpeciesCounts( {
        user_id: currentUser?.id,
        taxon_id: chunk,
        per_page: chunk.length,
        fields: {
          taxon: {
            id: true,
          },
        },
      } ),
      enabled: !!( currentUser && chunk.length > 0 ),
      // we don't really need to worry about a user's life list changing on this screen
      staleTime: Infinity,
      retry: ( failureCount: number, error: unknown ) => reactQueryRetry(
        failureCount,
        error,
        { queryKey: ["exploreV2SpeciesCountsSeen"] },
      ),
      retryDelay: ( failureCount: number, error: unknown ) => handleRetryDelay(
        failureCount,
        error,
      ),
    } ) ),
    combine: results => {
      const ids = new Set<number>( );
      // the combine callback unions the taxon ids present in the results
      // (i.e. observed by this user) across all chunks
      results.forEach( r => {
        const seen = ( r.data as { results?: SpeciesCountResult[] } | undefined )?.results;
        seen?.forEach( x => ids.add( x.taxon.id as number ) );
      } );
      // results holds every chunk's query state (redundant fetches prevented by cache).
      // Return a sorted array so this reference stays stable when the observed set is unchanged,
      // which keeps renderItem memoized.
      return Array.from( ids ).sort( ( a, b ) => a - b );
    },
  } );

  // observedIds is a stable, sorted reference,
  // so this Set is only rebuilt when the observed set actually changes.
  // observedIdSet.has is O(1) where observedIds.includes would be O(n)
  // sort of overkill but I think it's nice
  const observedIdSet = useMemo( ( ) => new Set( observedIds ), [observedIds] );

  const renderItem = useCallback(
    // eslint-plugin-react mistakes this render callback for a component and
    // flags its param type as unused prop types
    // eslint-disable-next-line react/no-unused-prop-types
    ( { item }: { item: SpeciesCountResult } ) => (
      <ExploreV2SpeciesGridItem
        // Unique key ensures component recreation so images don't get
        // recycled and show on the wrong taxon
        key={`taxon-${item.taxon.id}-${item.taxon.default_photo?.url}`}
        count={item.count}
        showSpeciesSeenCheckmark={observedIdSet.has( item.taxon.id )}
        style={gridItemStyle}
        taxon={item.taxon}
      />
    ),
    [gridItemStyle, observedIdSet],
  );

  return (
    <ExploreFlashList
      canFetch={enabled}
      contentContainerStyle={flashListStyle}
      data={data}
      fetchNextPage={fetchNextPage}
      hideLoadingWheel={!isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isConnected={isConnected}
      keyExtractor={( item: SpeciesCountResult ) => (
        `${item.taxon.id}-${item.taxon.default_photo?.url || "no-photo"}`
      )}
      layout="grid"
      numColumns={numColumns}
      renderItem={renderItem}
      totalResults={totalResults}
      testID="ExploreV2SpeciesList"
    />
  );
};

export default ExploreV2SpeciesView;
