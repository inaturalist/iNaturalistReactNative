import { fetchSpeciesCounts } from "api/observations";
import type { ApiTaxon } from "api/types";
import ExploreFlashList from "components/Explore/ExploreFlashList";
import ExploreV2SpeciesGridItem
  from "components/Explore/ExploreV2/components/ExploreV2SpeciesGridItem";
import type { ExploreV2QueryParams } from "components/Explore/ExploreV2/helpers/buildQueryParams";
import i18n from "i18next";
import React, { useCallback } from "react";
import Taxon from "realmModels/Taxon";
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
      ...( !currentUser && { locale } ),
      fields: {
        taxon: Taxon.LIMITED_TAXON_FIELDS,
      },
    },
    { enabled },
  );

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
        style={gridItemStyle}
        taxon={item.taxon}
      />
    ),
    [gridItemStyle],
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
