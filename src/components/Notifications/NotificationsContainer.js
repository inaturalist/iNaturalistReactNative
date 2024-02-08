// @flow
import { useNavigation } from "@react-navigation/native";
import NotificationsList from "components/Notifications/NotificationsList";
import type { Node } from "react";
import React, { useEffect } from "react";
import { useIsConnected } from "sharedHooks";
import useInfiniteNotificationsScroll from "sharedHooks/useInfiniteNotificationsScroll";

const NotificationsContainer = (): Node => {
  const navigation = useNavigation( );
  const isOnline = useIsConnected( );

  const {
    notifications,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isInitialLoading
  } = useInfiniteNotificationsScroll( );

  useEffect( ( ) => {
    navigation.addListener( "focus", ( ) => {
      if ( isOnline ) {
        refetch();
      }
    } );
  }, [isOnline, navigation, refetch] );

  return (
    <NotificationsList
      data={notifications}
      onEndReached={fetchNextPage}
      isOnline={isOnline}
      isLoading={isInitialLoading || isFetchingNextPage}
    />
  );
};

export default NotificationsContainer;
