import type { ApiNotification } from "api/types";
import NotificationsListItem from "components/Notifications/NotificationsListItem.tsx";
import {
  ActivityIndicator,
  Body2,
  CustomFlashList,
  CustomRefreshControl,
  InfiniteScrollLoadingWheel,
  OfflineNotice
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback } from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";
import type { Notification } from "sharedHooks/useInfiniteNotificationsScroll";

type Props = {
  data: ApiNotification[],
  isError?: boolean,
  isFetching?: boolean,
  isInitialLoading?: boolean,
  isConnected: boolean | null,
  onEndReached: ( ) => void,
  onRefresh: ( ) => void,
  refreshing: boolean,
  reload: ( ) => void
};

interface RenderItemProps {
  // It is used, not sure what the problem is
  // eslint-disable-next-line react/no-unused-prop-types
  item: Notification;
}

const NotificationsList = ( {
  data,
  isError,
  isFetching,
  isInitialLoading,
  isConnected,
  onEndReached,
  onRefresh,
  reload,
  refreshing
}: Props ) => {
  const { t } = useTranslation( );
  const user = useCurrentUser( );

  const renderItem = useCallback( ( { item }: RenderItemProps ) => (
    <NotificationsListItem notification={item} />
  ), [] );

  const renderItemSeparator = ( ) => <View className="border-b border-lightGray" />;

  const renderFooter = useCallback( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={!isFetching || data?.length === 0}
      isConnected={isConnected}
    />
  ), [isFetching, isConnected, data.length] );

  const renderEmptyComponent = useCallback( ( ) => {
    if ( isInitialLoading ) {
      return (
        <View className="h-full justify-center">
          <ActivityIndicator size={50} />
        </View>
      );
    }

    if ( isConnected === false ) {
      return <OfflineNotice onPress={reload} />;
    }

    let msg = t( "No-Notifications-Found" );
    let msg2 = null;
    if ( !user ) {
      msg = t( "Once-you-create-and-upload-observations" );
      msg2 = t( "You-will-see-notifications" );
    }
    if ( isError ) {
      msg = t( "Something-went-wrong" );
    }

    return (
      <>
        <Body2 className="mt-[150px] text-center mx-12">{msg}</Body2>
        {msg2 && <Body2 className="mt-4 text-center mx-12">{msg2}</Body2>}
      </>
    );
  }, [
    user,
    isError,
    isInitialLoading,
    isConnected,
    reload,
    t
  ] );

  const refreshControl = (
    <CustomRefreshControl
      accessibilityLabel={t( "Pull-to-refresh-notifications" )}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );

  return (
    <CustomFlashList
      ItemSeparatorComponent={renderItemSeparator}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      data={data}
      estimatedItemSize={85}
      keyExtractor={( item: ApiNotification ) => item.id}
      onEndReached={onEndReached}
      refreshing={isFetching}
      refreshControl={refreshControl}
      renderItem={renderItem}
    />
  );
};

export default NotificationsList;
