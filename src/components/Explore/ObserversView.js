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
  canFetch: boolean,
  isConnected: boolean,
  queryParams: Object,
  handleUpdateCount: Function
};

const LIST_STYLE = { paddingTop: 44 };

const ObserversView = ( {
  canFetch,
  isConnected,
  queryParams,
  handleUpdateCount
}: Props ): Node => {
  const { t } = useTranslation( );
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    totalResults
  } = useInfiniteScroll(
    "fetchObservers",
    fetchObservers,
    {
      ...queryParams,
      order_by: "observation_count",
      fields: {
        user: User.LIMITED_FIELDS
      }
    },
    {
      enabled: canFetch
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
    handleUpdateCount( "observers", totalResults );
  }, [totalResults, handleUpdateCount] );

  return (
    <ExploreFlashList
      canFetch={canFetch}
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
      testID="ExploreObserversAnimatedList"
    />
  );
};

export default ObserversView;
