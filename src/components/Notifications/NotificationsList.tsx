import NotificationsListItem from "components/Notifications/NotificationsListItem";
import {
  ActivityIndicator,
  Body1,
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
  followingTabIsActive: boolean;
  isError?: boolean;
  isFetching?: boolean;
  isInitialLoading?: boolean;
  isConnected: boolean | null;
  showStillLoadingMessage: boolean;
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
  followingTabIsActive,
  isError,
  isFetching,
  isInitialLoading,
  isConnected,
  showStillLoadingMessage,
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
    // Offline/retry when disconnected or request fails
    if ( isConnected === false || isError ) {
      return <OfflineNotice onPress={reload} />;
    }

    if ( isInitialLoading ) {
      return (
        <View className="h-full justify-center">
          <ActivityIndicator size={50} />
          {showStillLoadingMessage && (
            <Body1 className="mt-4 text-center mx-12">
              {t( "Still-loading" )}
            </Body1>
          )}
        </View>
      );
    }

    // Empty/error state
    let msg = followingTabIsActive
      ? t(
        "You-have-no-notifications-you-will-see-updates-to-obs-you-have-left-IDs-or-comments-on",
      )
      : t( "You-have-no-notifications-get-started-by-creating-your-own-observations" );
    let msg2 = null;
    if ( !currentUser ) {
      msg = t( "Once-you-create-and-upload-observations" );
      msg2 = t( "You-will-see-notifications" );
    }

    return (
      <>
        <Body2 className="mt-[150px] text-center mx-12">{msg}</Body2>
        {msg2 && <Body2 className="mt-4 text-center mx-12">{msg2}</Body2>}
      </>
    );
  }, [
    currentUser,
    followingTabIsActive,
    isError,
    isInitialLoading,
    isConnected,
    showStillLoadingMessage,
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
