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
  canFetch: boolean,
  isConnected: boolean,
  queryParams: Object,
  handleUpdateCount: Function
};

const LIST_STYLE = { paddingTop: 44 };

const IdentifiersView = ( {
  canFetch,
  isConnected,
  queryParams,
  handleUpdateCount
}: Props ): Node => {
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    totalResults
  } = useInfiniteScroll(
    "fetchIdentifiers",
    fetchIdentifiers,
    {
      ...queryParams,
      fields: {
        identifications_count: true,
        user: User.LIMITED_FIELDS
      }
    },
    {
      enabled: canFetch
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
    handleUpdateCount( "identifiers", totalResults );
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
      testID="ExploreIdentifiersAnimatedList"
    />
  );
};

export default IdentifiersView;
