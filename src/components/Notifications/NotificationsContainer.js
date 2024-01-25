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
    status,
    refetch
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
      isFetchingNextPage={isFetchingNextPage}
      status={status}
      isOnline={isOnline}
    />
  );
};

export default NotificationsContainer;
