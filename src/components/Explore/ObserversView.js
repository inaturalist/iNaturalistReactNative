// @flow
import { fetchObservers } from "api/observations";
import { UserListItem } from "components/SharedComponents";
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

const LIST_STYLE = { paddingTop: 44 };

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
