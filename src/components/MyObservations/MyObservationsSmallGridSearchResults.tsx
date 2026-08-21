import { ActivityIndicator, SmallGrid } from "components/SharedComponents";
import type { SmallGridItem } from "components/SharedComponents/SmallGrid";
import { View } from "components/styledComponents";
import React, { useCallback, useMemo } from "react";
import { useCurrentUser } from "sharedHooks";

import SmallGridObsItemContainer from "./SmallGridObsItemContainer";

type SearchResultRow = SmallGridItem<string, never>;

interface Props {
  isFetchingNextPage: boolean;
  listHeaderContent?: React.ReactElement | null;
  observationIds: { uuid: string }[];
  onEndReached: ( ) => void;
}

// This is the small grid while a taxon search is active; one flat grid of results with no headers.
const MyObservationsSmallGridSearchResults = ( {
  isFetchingNextPage,
  listHeaderContent,
  observationIds,
  onEndReached,
}: Props ) => {
  const currentUser = useCurrentUser( );

  const rows = useMemo<SearchResultRow[]>( ( ) => observationIds.map( ( { uuid } ) => ( {
    type: "tile",
    key: uuid,
    tile: uuid,
  } ) ), [observationIds] );

  const renderTile = useCallback( ( uuid: string, width: number, height: number ) => (
    <SmallGridObsItemContainer
      currentUser={currentUser}
      height={height}
      uuid={uuid}
      width={width}
    />
  ), [currentUser] );

  const listFooterContent = useMemo( ( ) => {
    if ( rows.length === 0 ) {
      return (
        <View className="self-center mt-[150px]">
          <ActivityIndicator size={50} testID="MyObservationsSmallGridSearchResults.loading" />
        </View>
      );
    }
    if ( !isFetchingNextPage ) return null;
    return (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    );
  }, [isFetchingNextPage, rows.length] );

  return (
    <SmallGrid
      data={rows}
      listFooterContent={listFooterContent}
      listHeaderContent={listHeaderContent}
      onEndReached={onEndReached}
      renderTile={renderTile}
      testID="MyObservationsSmallGridSearchResults"
    />
  );
};

export default MyObservationsSmallGridSearchResults;
