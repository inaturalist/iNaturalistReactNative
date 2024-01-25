// @flow

import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import NotificationsListItem from "components/Notifications/NotificationsListItem";
import {
  Body2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { ActivityIndicator, Animated } from "react-native";
import { useTranslation } from "sharedHooks";

const AnimatedFlashList = Animated.createAnimatedComponent( FlashList );

type Props = {
    data: Object,
    isOnline: boolean,
    dataCanBeFetched:boolean,
    status: string,
    onEndReached: Function,
    isFetchingNextPage?: boolean
  };

const NotificationsList = ( {
  data, isOnline, dataCanBeFetched, status, onEndReached, isFetchingNextPage
}: Props ): Node => {
  const { t } = useTranslation( );

  const renderItem = useCallback( ( { item } ) => (
    <NotificationsListItem item={item} />
  ), [] );

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={!isFetchingNextPage}
      isOnline={isOnline}
      explore={false}
    />
  ), [isFetchingNextPage, isOnline] );

  const renderEmptyComponent = useCallback( ( ) => {
    const showEmptyScreen = ( isOnline )
      ? (
        <Body2 className="mt-[150px] self-center mx-12">
          {t( "No-Notifications-Found" )}
        </Body2>
      )
      : (
        <Body2 className="mt-[150px] self-center mx-12">
          {t( "Offline-No-Notifications" )}
        </Body2>
      );
    console.log( status, dataCanBeFetched, isFetchingNextPage );

    return ( ( status === "loading" ) )
      ? (
        <View className="self-center mt-[150px]">
          <ActivityIndicator size="large" testID="NotificationsFlashList.loading" />
        </View>
      )
      : showEmptyScreen;
  }, [dataCanBeFetched, isFetchingNextPage, isOnline, status, t] );

  return (
    <View className="h-full">
      <AnimatedFlashList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderItemSeparator}
        estimatedItemSize={20}
        onEndReached={onEndReached}
        refreshing={isFetchingNextPage}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

export default NotificationsList;
