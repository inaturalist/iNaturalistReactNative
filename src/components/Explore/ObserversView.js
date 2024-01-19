// @flow
import { fetchObservers } from "api/observations";
import UserListItem from "components/SharedComponents/UserListItem";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import User from "realmModels/User";
import { useInfiniteScroll } from "sharedHooks";

import ExploreFlashList from "./ExploreFlashList";

type Props = {
  count: Object,
  isOnline: boolean,
  queryParams: Object,
  updateCount: Function
};

const ObserversView = ( {
  count,
  isOnline,
  queryParams,
  updateCount
}: Props ): Node => {
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
      fields: {
        user: User.FIELDS
      }
    }
  );

  const renderItem = ( { item } ) => (
    <UserListItem
      item={item}
      count={item.observation_count}
      countText="X-Observations"
    />
  );

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  useEffect( ( ) => {
    if ( totalResults && count.observers !== totalResults ) {
      updateCount( { observers: totalResults } );
    }
  }, [totalResults, updateCount, count] );

  return (
    <ExploreFlashList
      data={data}
      estimatedItemSize={98}
      fetchNextPage={fetchNextPage}
      hideLoadingWheel={!isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isOnline={isOnline}
      keyExtractor={item => item.user.id}
      renderItem={renderItem}
      renderItemSeparator={renderItemSeparator}
      status={status}
      testID="ExploreObserversAnimatedList"
    />
  );
};

export default ObserversView;
