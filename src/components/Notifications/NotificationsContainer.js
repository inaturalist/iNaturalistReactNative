// @flow
import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import NotificationsList from "components/Notifications/NotificationsList";
import type { Node } from "react";
import React, { useEffect } from "react";
import { log } from "sharedHelpers/logger";
import { useInfiniteNotificationsScroll, usePerformance } from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";

const logger = log.extend( "NotificationsContainer" );

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

  const { loadTime } = usePerformance( {
    isLoading: isInitialLoading
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }

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
