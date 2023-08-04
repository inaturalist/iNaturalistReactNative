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
  setHeaderRight: Function,
  handleScroll: Function
};

const IdentifiersView = ( {
  setHeaderRight,
  handleScroll
}: Props ): Node => {
  const { t } = useTranslation( );
  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    totalResults
  } = useInfiniteScroll(
    "fetchIdentifiers",
    fetchIdentifiers,
    {
      place_id: 54321,
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
      testID="ExploreIdentifiersAnimatedList"
      handleScroll={handleScroll}
      isFetchingNextPage={isFetchingNextPage}
      data={data}
      renderItem={renderItem}
      renderItemSeparator={renderItemSeparator}
      fetchNextPage={fetchNextPage}
      estimatedItemSize={98}
      keyExtractor={item => item.user.id}
    />
  );
};

export default IdentifiersView;
