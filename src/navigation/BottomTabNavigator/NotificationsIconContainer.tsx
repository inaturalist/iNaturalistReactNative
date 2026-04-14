import { fetchUnviewedObservationUpdatesCount } from "api/observations";
import NotificationsIcon from "navigation/BottomTabNavigator/NotificationsIcon";
import React, { useEffect, useState } from "react";
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
  const [hasUnread, setHasUnread] = useState( false );
  const currentUser = useCurrentUser( );
  const observationMarkedAsViewedAt = useStore( state => state.observationMarkedAsViewedAt );

  const { data: unviewedUpdatesCount } = useAuthenticatedQuery(
    [
      "notificationsCount",
      // We want to check for notifications when the user views an
      // observation, because that might make the indicator go away
      observationMarkedAsViewedAt,
    ],
    optsWithAuth => fetchUnviewedObservationUpdatesCount( {}, optsWithAuth ),
    {
      enabled: !!currentUser,
      // We want to check for notifications at a set interval, but
      // keep a stable query key so we don't create unbounded cached queries.
      refetchInterval: 60_000,
    },
  );

  // Show icon when there are unread updates
  useEffect( () => {
    setHasUnread( unviewedUpdatesCount > 0 );
  }, [unviewedUpdatesCount] );

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
