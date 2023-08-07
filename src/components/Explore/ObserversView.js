// @flow
import { fetchObservers } from "api/observations";
import UserListItem from "components/SharedComponents/UserListItem";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import User from "realmModels/User";
import { useInfiniteScroll, useTranslation } from "sharedHooks";

import ExploreFlashList from "./ExploreFlashList";

type Props = {
  setHeaderRight: Function,
  handleScroll: Function,
  queryParams: Object
};

const ObserversView = ( {
  setHeaderRight,
  handleScroll,
  queryParams
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
      fields: {
        user: User.USER_FIELDS
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
    if ( totalResults ) {
      setHeaderRight( t( "X-Observers", { count: totalResults } ) );
    }
  }, [totalResults, setHeaderRight, t] );

  return (
    <ExploreFlashList
      testID="ExploreObserversAnimatedList"
      handleScroll={handleScroll}
      isFetchingNextPage={isFetchingNextPage}
      data={data}
      renderItem={renderItem}
      renderItemSeparator={renderItemSeparator}
      fetchNextPage={fetchNextPage}
      estimatedItemSize={98}
      keyExtractor={item => item.user.id}
      status={status}
    />
  );
};

export default ObserversView;
