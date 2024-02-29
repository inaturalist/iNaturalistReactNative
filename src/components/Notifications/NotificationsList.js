// @flow

import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import NotificationsListItem from "components/Notifications/NotificationsListItem";
import { Body2, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  data: Object,
  isLoading?: boolean,
  isOnline: boolean,
  onEndReached: Function
};

const NotificationsList = ( {
  data,
  isOnline,
  onEndReached,
  isLoading
}: Props ): Node => {
  const { t } = useTranslation( );

  const renderItem = useCallback( ( { item } ) => (
    <NotificationsListItem item={item} />
  ), [] );

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={!isLoading}
      isOnline={isOnline}
      explore={false}
    />
  ), [isLoading, isOnline] );

  const renderEmptyComponent = useCallback( ( ) => {
    if ( isLoading ) return null;
    return isOnline
      ? (
        <Body2 className="mt-[150px] text-center mx-12">
          {t( "No-Notifications-Found" )}
        </Body2>
      )
      : (
        <Body2 className="mt-[150px] text-center mx-12">
          {t( "Offline-No-Notifications" )}
        </Body2>
      );
  }, [isLoading, isOnline, t] );

  return (
    <ViewWrapper className="h-full">
      <FlashList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderItemSeparator}
        estimatedItemSize={20}
        onEndReached={onEndReached}
        refreshing={isLoading}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
      />
    </ViewWrapper>
  );
};

export default NotificationsList;
