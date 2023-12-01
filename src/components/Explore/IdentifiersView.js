// @flow
import { fetchIdentifiers } from "api/observations";
import UserListItem from "components/SharedComponents/UserListItem";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import User from "realmModels/User";
import { useInfiniteScroll, useTranslation } from "sharedHooks";

import ExploreFlashList from "./ExploreFlashList";

type Props = {
  handleScroll: Function,
  isOnline: boolean,
  queryParams: Object,
  setHeaderRight: Function
};

const IdentifiersView = ( {
  handleScroll,
  isOnline,
  queryParams,
  setHeaderRight
}: Props ): Node => {
  const { t } = useTranslation( );

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
        user: User.USER_FIELDS
      }
    }
  );

  const renderItem = ( { item } ) => (
    <UserListItem
      item={item}
      count={item.count}
      countText="X-Identifications"
    />
  );

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  useEffect( ( ) => {
    if ( totalResults ) {
      setHeaderRight( t( "X-Identifiers", { count: totalResults } ) );
    }
  }, [totalResults, setHeaderRight, t] );

  return (
    <ExploreFlashList
      data={data}
      estimatedItemSize={98}
      fetchNextPage={fetchNextPage}
      handleScroll={handleScroll}
      hideLoadingWheel={!isFetchingNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isOnline={isOnline}
      keyExtractor={item => item.user.id}
      renderItem={renderItem}
      renderItemSeparator={renderItemSeparator}
      status={status}
      testID="ExploreIdentifiersAnimatedList"
    />
  );
};

export default IdentifiersView;
