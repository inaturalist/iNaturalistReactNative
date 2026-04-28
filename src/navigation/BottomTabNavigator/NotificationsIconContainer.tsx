import { fetchUnviewedObservationUpdatesCount } from "api/observations";
import NotificationsIcon from "navigation/BottomTabNavigator/NotificationsIcon";
import React, { useEffect } from "react";
import {
  useAuthenticatedQuery,
  useCurrentUser,
} from "sharedHooks";
import useStore from "stores/useStore";

interface Props {
  icon: string;
  active: boolean;
  size: number;
}

const NotificationsIconContainer = ( {
  size,
  icon,
  active,
}: Props ) => {
  const currentUser = useCurrentUser( );
  const observationMarkedAsViewedAt = useStore( state => state.observationMarkedAsViewedAt );

  // TODO: enable fields if it makes sense
  // https://linear.app/inaturalist/issue/MOB-1362/enable-fields-for-unviewed-updates-count-in-notificationsicon
  const { data: unviewedUpdatesCount, refetch } = useAuthenticatedQuery(
    [
      "notificationsCount",
    ],
    optsWithAuth => fetchUnviewedObservationUpdatesCount( {}, optsWithAuth ),
    {
      enabled: !!currentUser,
      // We want to check for notifications at a set interval, but
      // keep a stable query key so we don't create unbounded cached queries.
      refetchInterval: 60_000,
    },
  );

  useEffect( () => {
    refetch();
  }, [observationMarkedAsViewedAt, refetch] );

  const hasUnread = ( unviewedUpdatesCount ?? 0 ) > 0;

  return (
    <NotificationsIcon
      icon={icon}
      unread={hasUnread}
      active={active}
      size={size}
    />
  );
};

export default NotificationsIconContainer;
