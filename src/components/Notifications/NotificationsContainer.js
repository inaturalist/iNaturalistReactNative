// @flow
import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import NotificationsList from "components/Notifications/NotificationsList";
import type { Node } from "react";
import React, { useEffect } from "react";
import useInfiniteNotificationsScroll from "sharedHooks/useInfiniteNotificationsScroll";

const NotificationsContainer = (): Node => {
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );

  const {
    notifications,
    fetchNextPage,
    refetch,
    isInitialLoading,
    isFetching,
    isError
  } = useInfiniteNotificationsScroll( );

  useEffect( ( ) => {
    navigation.addListener( "focus", ( ) => {
      if ( isConnected ) {
        refetch();
      }
    } );
  }, [isConnected, navigation, refetch] );

  return (
    <NotificationsList
      data={notifications}
      isError={isError}
      isFetching={isFetching}
      isInitialLoading={isInitialLoading}
      isConnected={isConnected}
      onEndReached={fetchNextPage}
      reload={refetch}
    />
  );
};

export default NotificationsContainer;
