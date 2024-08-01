// @flow
import { fetchObservers } from "api/observations";
import { UserListItem } from "components/SharedComponents";
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

const ObserversView = ( {
  count,
  isConnected,
  queryParams,
  updateCount
}: Props ): Node => {
  const { t } = useTranslation( );
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    totalResults,
    status
  } = useInfiniteScroll(
    "fetchObservers",
    fetchObservers,
    {
      ...queryParams,
      order_by: "observation_count",
      fields: {
        user: User.FIELDS
      }
    }
  );

  const renderItem = ( { item } ) => (
    <UserListItem
      item={item}
      countText={t( "X-Observations", { count: item.observation_count } )}
    />
  );

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  useEffect( ( ) => {
    if ( count.observers !== totalResults ) {
      updateCount( { observers: totalResults } );
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
      testID="ExploreObserversAnimatedList"
    />
  );
};

export default ObserversView;
