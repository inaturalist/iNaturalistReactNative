import { fetchSpeciesCounts } from "api/observations";
import type { ApiTaxon } from "api/types";
import ExploreFlashList from "components/Explore/ExploreFlashList";
import ExploreV2SpeciesGridItem
  from "components/Explore/ExploreV2/components/ExploreV2SpeciesGridItem";
import i18n from "i18next";
import React, { useCallback, useMemo } from "react";
import Taxon from "realmModels/Taxon";
import type { RealmUser } from "realmModels/types";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useGridLayout from "sharedHooks/useGridLayout";
import useInfiniteScroll from "sharedHooks/useInfiniteScroll";
import useQuery from "sharedHooks/useQuery";

interface SpeciesCountResult {
  count: number;
  taxon: ApiTaxon;
}

interface Props {
  enabled: boolean;
  isConnected: boolean | null;
  params: object;
}

const ExploreV2SpeciesView = ( { enabled, isConnected, params }: Props ) => {
  const currentUser = useCurrentUser( ) as RealmUser | null;
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
      ...( !currentUser && { locale } ),
      fields: {
        taxon: Taxon.LIMITED_TAXON_FIELDS,
      },
    },
    { enabled },
  );

  const taxonIds = ( data as SpeciesCountResult[] ).map( r => r.taxon.id as number );

  const { data: seenByCurrentUser } = useQuery(
    ["exploreV2SpeciesCountsSeen", taxonIds.join( "," )],
    ( ) => fetchSpeciesCounts( {
      user_id: currentUser?.id,
      taxon_id: taxonIds,
      fields: {
        taxon: {
          id: true,
        },
      },
    } ),
    {
      enabled: !!( taxonIds.length > 0 && currentUser ),
      // Each new page changes the query key; keeping the previous response
      // while the new one loads prevents the checkmarks from flickering off
      placeholderData: ( previousData: object ) => previousData,
    },
  );

  const observedTaxonIds = useMemo( ( ) => {
    const seenResults = ( seenByCurrentUser as { results?: SpeciesCountResult[] } )?.results;
    return new Set( seenResults?.map( r => r.taxon.id as number ) || [] );
  }, [seenByCurrentUser] );

  const renderItem = useCallback(
    // eslint-plugin-react mistakes this render callback for a component and
    // flags its param type as unused prop types
    // eslint-disable-next-line react/no-unused-prop-types
    ( { item }: { item: SpeciesCountResult } ) => (
      <ExploreV2SpeciesGridItem
        // Unique key ensures component recreation so images don't get
        // recycled and show on the wrong taxon
        key={`taxon-${item.taxon.id}-${item.taxon?.default_photo?.url}`}
        count={item?.count}
        showSpeciesSeenCheckmark={observedTaxonIds.has( item.taxon.id as number )}
        style={gridItemStyle}
        taxon={item?.taxon}
      />
    ),
    [gridItemStyle, observedTaxonIds],
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
        `${item.taxon.id}-${item?.taxon?.default_photo?.url || "no-photo"}`
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
