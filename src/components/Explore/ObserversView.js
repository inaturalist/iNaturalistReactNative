// @flow
import { FlashList } from "@shopify/flash-list";
import { fetchObservers } from "api/observations";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import UserListItem from "components/SharedComponents/UserListItem";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect } from "react";
import { Animated } from "react-native";
import User from "realmModels/User";
import { useInfiniteScroll, useTranslation } from "sharedHooks";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

type Props = {
  testID: string,
  setHeaderRight: Function
};

const ObserversView = ( {
  testID,
  setHeaderRight
}: Props ): Node => {
  const { t } = useTranslation( );
  const {
    data: observerList,
    isFetchingNextPage,
    fetchNextPage,
    totalResults
  } = useInfiniteScroll(
    "fetchObservers",
    fetchObservers,
    {
      place_id: 54321,
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

  const renderFooter = ( ) => (
    <InfiniteScrollLoadingWheel
      isFetchingNextPage={isFetchingNextPage}
    />
  );

  useEffect( ( ) => {
    if ( totalResults ) {
      setHeaderRight( t( "X-Observers", { count: totalResults } ) );
    }
  }, [totalResults, setHeaderRight, t] );

  if ( !observerList || observerList.length === 0 ) {
    return null;
  }

  return (
    <View className="h-full mt-[180px]">
      <AnimatedFlashList
        data={observerList}
        estimatedItemSize={98}
        testID={testID}
        horizontal={false}
        keyExtractor={item => item.user.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderItemSeparator}
        ListFooterComponent={renderFooter}
        initialNumToRender={5}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        refreshing={isFetchingNextPage}
        accessible
      />
    </View>
  );
};

export default ObserversView;
