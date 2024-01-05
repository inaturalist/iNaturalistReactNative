// @flow

import { fetchObservationUpdates } from "api/observations";
import NotificationsList from "components/Notifications/NotificationsList";
import {
  Body2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useIsConnected, useTranslation } from "sharedHooks";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";

const NotificationsContainer = (): Node => {
  const isOnline = useIsConnected( );
  const currentUser = useCurrentUser();
  const { t } = useTranslation( );

  // const { data } = useInfiniteNotificationsScroll( {} );
  // console.log( "data in notifications container", data );

  // Request params for fetching unviewed updates
  const params = {
    observations_by: "owner",
    viewed: true,
    fields: "all",
    per_page: 50,
    page: 0
  };

  const {
    data
  } = useAuthenticatedQuery(
    ["fetchObservationNotificationUpdates"],
    optsWithAuth => fetchObservationUpdates( params, optsWithAuth ),
    { enabled: true }
  );

  const messageClassName = "flex justify-center items-center h-full mx-12";

  if ( !data && isOnline && currentUser ) {
    return (
      <View className={messageClassName}>
        <Body2>{t( "No-Notifications-Found" )}</Body2>
      </View>
    );
  }

  if ( !data && !isOnline && currentUser ) {
    return (
      <View className={messageClassName}>
        <Body2>{t( "Offline-No-Notifications" )}</Body2>
      </View>
    );
  }

  if ( !currentUser ) {
    return (
      <View className={messageClassName}>
        <Body2>{t( "No-Notifications-Found" )}</Body2>
      </View>
    );
  }
  return (
    <NotificationsList data={data} />
  );
};

export default NotificationsContainer;
