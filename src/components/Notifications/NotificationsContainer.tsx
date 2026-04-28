import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useFocusEffect } from "@react-navigation/native";
import type { ApiObservationsUpdatesParams } from "api/types";
import NotificationsList from "components/Notifications/NotificationsList";
import React, { useCallback, useEffect, useState } from "react";
import type { RealmUser } from "realmModels/types";
import { log } from "sharedHelpers/logger";
import {
  useInfiniteNotificationsScroll,
  usePerformance,
} from "sharedHooks";
import useDebugMode from "sharedHooks/useDebugMode";

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
  const { isConnected } = useNetInfo( );
  const [refreshing, setRefreshing] = useState( false );

  const {
    fetchNextPage,
    isError,
    isFetching,
    isInitialLoading,
    showStillLoadingMessage,
    notifications,
    refetch,
  } = useInfiniteNotificationsScroll( notificationParams );

  const { loadTime } = usePerformance( {
    isLoading: isInitialLoading,
  } );
  const { isDebug } = useDebugMode( );
  useEffect( () => {
    if ( isDebug && loadTime ) {
      logger.info( loadTime );
    }
  }, [isDebug, loadTime] );

  useFocusEffect(
    useCallback( ( ) => {
      if ( isConnected && currentUser ) {
        refetch( );
      }
    }, [isConnected, currentUser, refetch] ),
  );

  const onRefresh = async () => {
    if ( currentUser ) {
      setRefreshing( true );
      await refetch();
      if ( typeof ( onRefreshProp ) === "function" ) onRefreshProp( );
      setRefreshing( false );
    }
  };

  const followingTabIsActive = notificationParams.observations_by === "following";

  return (
    <NotificationsList
      currentUser={currentUser}
      data={notifications}
      followingTabIsActive={followingTabIsActive}
      isError={isError}
      isFetching={isFetching}
      isInitialLoading={isInitialLoading}
      isConnected={isConnected}
      showStillLoadingMessage={showStillLoadingMessage}
      onEndReached={fetchNextPage}
      reload={refetch}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

export default NotificationsContainer;
