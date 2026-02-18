import NotificationsListItem from "components/Notifications/NotificationsListItem";
import {
  ActivityIndicator,
  Body2,
  CustomFlashList,
  CustomRefreshControl,
  InfiniteScrollLoadingWheel,
  OfflineNotice,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, { useCallback, useMemo } from "react";
import type { RealmUser } from "realmModels/types";
import { useTranslation } from "sharedHooks";
import type { Notification } from "sharedHooks/useInfiniteNotificationsScroll";

const ItemSeparator = ( ) => <View className="border-b border-lightGray" />;

interface Props {
  currentUser: RealmUser | null;
  data: Notification[];
  isError?: boolean;
  isFetching?: boolean;
  isInitialLoading?: boolean;
  isConnected: boolean | null;
  loadingTimedOut: boolean;
  onEndReached: ( ) => void;
  onRefresh: ( ) => void;
  refreshing: boolean;
  reload: ( ) => void;
}

interface RenderItemProps {
  // It is used, not sure what the problem is
  // eslint-disable-next-line react/no-unused-prop-types
  item: Notification;
}

const NotificationsList = ( {
  currentUser,
  data,
  isError,
  isFetching,
  isInitialLoading,
  isConnected,
  loadingTimedOut,
  onEndReached,
  onRefresh,
  reload,
  refreshing,
}: Props ) => {
  const { t } = useTranslation( );
  const renderItem = useCallback( ( { item }: RenderItemProps ) => (
    <NotificationsListItem notification={item} />
  ), [] );

  const footerComponent = useMemo( ( ) => (
    <InfiniteScrollLoadingWheel
      hideLoadingWheel={!isFetching || data?.length === 0}
      isConnected={isConnected}
    />
  ), [isFetching, isConnected, data.length] );

  const emptyComponent = useMemo( ( ) => {
    // show an offline/retry state if the user isn't connected or this request just takes too long
    if ( isConnected === false || loadingTimedOut ) {
      return <OfflineNotice onPress={reload} />;
    }

    // Loading
    if ( isInitialLoading ) {
      return (
        <View className="h-full justify-center">
          <ActivityIndicator size={50} />
        </View>
      );
    }

    // Empty/error state
    let msg = t( "No-Notifications-Found" );
    let msg2 = null;
    if ( !currentUser ) {
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
    currentUser,
    isError,
    isInitialLoading,
    isConnected,
    loadingTimedOut,
    reload,
    t,
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
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={emptyComponent}
      ListFooterComponent={footerComponent}
      data={data}
      keyExtractor={( item: Notification ) => item.id}
      onEndReached={onEndReached}
      refreshing={isFetching}
      refreshControl={refreshControl}
      renderItem={renderItem}
    />
  );
};

export default NotificationsList;
