// @flow
import { fetchIdentifiers } from "api/observations";
import UserListItem from "components/SharedComponents/UserListItem";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import User from "realmModels/User.ts";
import { useInfiniteScroll, useTranslation } from "sharedHooks";

import ExploreFlashList from "./ExploreFlashList";

type Props = {
  count: Object,
  isConnected: boolean,
  queryParams: Object,
  updateCount: Function
};

const LIST_STYLE = { paddingTop: 44 };

const IdentifiersView = ( {
  count,
  isConnected,
  queryParams,
  updateCount
}: Props ): Node => {
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    status,
    totalResults
  } = useInfiniteScroll(
    "fetchIdentifiers",
    fetchIdentifiers,
    {
      ...queryParams,
      fields: {
        identifications_count: true,
        user: User.FIELDS
      }
    }
  );
  const { t } = useTranslation( );

  const renderItem = ( { item } ) => (
    <UserListItem
      item={item}
      countText={t( "X-Identifications", { count: item.count } )}
    />
  );

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  useEffect( ( ) => {
    if ( totalResults && count.identifiers !== totalResults ) {
      updateCount( { identifiers: totalResults } );
    }
  }, [totalResults, updateCount, count] );

  return (
    <ExploreFlashList
      contentContainerStyle={LIST_STYLE}
      data={data}
      estimatedItemSize={98}
      fetchNextPage={fetchNextPage}
      hideLoadingWheel={!isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isConnected={isConnected}
      keyExtractor={item => item.user.id}
      renderItem={renderItem}
      renderItemSeparator={renderItemSeparator}
      status={status}
      testID="ExploreIdentifiersAnimatedList"
    />
  );
};

export default IdentifiersView;
