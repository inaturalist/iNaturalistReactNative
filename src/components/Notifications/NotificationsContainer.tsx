import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import type { ApiObservationsUpdatesParams } from "api/types";
import NotificationsList from "components/Notifications/NotificationsList";
import React, { useEffect, useState } from "react";
import type { RealmUser } from "realmModels/types";
import { log } from "sharedHelpers/logger";
import { useInfiniteNotificationsScroll, usePerformance } from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";

const logger = log.extend( "NotificationsContainer" );

interface Props {
  currentUser: RealmUser | null;
  notificationParams: ApiObservationsUpdatesParams;
  onRefresh?: ( ) => void;
}

const NotificationsContainer = ( {
  currentUser,
  notificationParams,
  onRefresh: onRefreshProp,
}: Props ) => {
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );
  const [refreshing, setRefreshing] = useState( false );

  const {
    fetchNextPage,
    isError,
    isFetching,
    isInitialLoading,
    loadingTimedOut,
    notifications,
    refetch,
  } = useInfiniteNotificationsScroll( notificationParams );

  const { loadTime } = usePerformance( {
    isLoading: isInitialLoading,
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      if ( isConnected && currentUser ) {
        refetch();
      }
    } );
    return unsubscribe;
  }, [isConnected, currentUser, navigation, refetch] );

  const onRefresh = async () => {
    if ( currentUser ) {
      setRefreshing( true );
      await refetch();
      if ( typeof ( onRefreshProp ) === "function" ) onRefreshProp( );
      setRefreshing( false );
    }
  };

  return (
    <NotificationsList
      currentUser={currentUser}
      data={notifications}
      isError={isError}
      isFetching={isFetching}
      isInitialLoading={isInitialLoading}
      isConnected={isConnected}
      loadingTimedOut={loadingTimedOut}
      onEndReached={fetchNextPage}
      reload={refetch}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default NotificationsContainer;
