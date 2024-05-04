// @flow

import { FlashList } from "@shopify/flash-list";
import InfiniteScrollLoadingWheel from "components/MyObservations/InfiniteScrollLoadingWheel";
import NotificationsListItem from "components/Notifications/NotificationsListItem";
import { Body2, OfflineNotice, ViewWrapper } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { useTranslation } from "sharedHooks";

type Props = {
  data: Object,
  isError?: boolean,
  isLoading?: boolean,
  isOnline: boolean,
  onEndReached: Function,
  reload: Function
};

const NotificationsList = ( {
  data,
  isError,
  isLoading,
  isOnline,
  onEndReached,
  reload
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

    if ( !isOnline ) {
      return <OfflineNotice onPress={reload} />;
    }

    let msg = t( "No-Notifications-Found" );
    if ( isError ) {
      msg = t( "Something-went-wrong" );
    }

    return <Body2 className="mt-[150px] text-center mx-12">{msg}</Body2>;
  }, [
    isError,
    isLoading,
    isOnline,
    reload,
    t
  ] );

  if ( !data || data.length === 0 ) {
    return (
      <ViewWrapper>
        {renderEmptyComponent( )}
      </ViewWrapper>
    );
  }

  return (
    <ViewWrapper>
      <FlashList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderItemSeparator}
        estimatedItemSize={20}
        onEndReached={onEndReached}
        refreshing={isLoading}
        ListFooterComponent={renderFooter}
      />
    </ViewWrapper>
  );
};

export default NotificationsList;
