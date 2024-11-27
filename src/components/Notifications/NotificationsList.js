// @flow

import NotificationsListItem from "components/Notifications/NotificationsListItem";
import {
  ActivityIndicator, Body2, CustomFlashList,
  CustomRefreshControl,
  InfiniteScrollLoadingWheel,
  OfflineNotice, ViewWrapper
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { useCurrentUser, useTranslation } from "sharedHooks";

type Props = {
  data: Object,
  isError?: boolean,
  isFetching?: boolean,
  isInitialLoading?: boolean,
  isConnected: boolean,
  onEndReached: Function,
  reload: Function,
  refreshing: boolean,
  onRefresh: Function
};

const NotificationsList = ( {
  data,
  isError,
  isFetching,
  isInitialLoading,
  isConnected,
  onEndReached,
  reload,
  refreshing,
  onRefresh
}: Props ): Node => {
  const { t } = useTranslation( );
  const user = useCurrentUser( );

  const renderItem = useCallback( ( { item } ) => (
    <NotificationsListItem item={item} />
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
    <ViewWrapper>
      <CustomFlashList
        ItemSeparatorComponent={renderItemSeparator}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        data={data}
        estimatedItemSize={85}
        keyExtractor={item => item.id}
        onEndReached={onEndReached}
        refreshing={isFetching}
        renderItem={renderItem}
        refreshControl={refreshControl}
      />
    </ViewWrapper>
  );
};

export default NotificationsList;
