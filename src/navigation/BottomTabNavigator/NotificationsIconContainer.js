// @flow
import { fetchUnviewedObservationUpdatesCount } from "api/observations";
import NotificationsIcon from "navigation/BottomTabNavigator/NotificationsIcon";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import {
  useAuthenticatedQuery,
  useCurrentUser,
  useInterval
} from "sharedHooks";

type Props = {
  testID: string,
  icon: any,
  onPress: any,
  active:boolean,
  accessibilityLabel: string,
  accessibilityRole?: string,
  accessibilityHint?: string,
  size: number,
  width?: number,
  height?: number
};

const NotificationsIconContainer = ( {
  testID,
  size,
  icon,
  onPress,
  active,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = "tab",
  width,
  height
}: Props ): Node => {
  const [hasUnread, setHasUnread] = useState( false );
  const [numFetchIntervals, setNumFetchIntervals] = useState( 0 );
  const currentUser = useCurrentUser();

  const { data: unviewedUpdatesCount } = useAuthenticatedQuery(
    ["notificationsCount", numFetchIntervals],
    optsWithAuth => fetchUnviewedObservationUpdatesCount( optsWithAuth ),
    {
      enabled: !!currentUser
    }
  );

  // Show icon when there are unread updates
  useEffect( () => {
    setHasUnread( unviewedUpdatesCount > 0 );
  }, [unviewedUpdatesCount] );

  // Fetch new updates count every minute by changing the request key
  useInterval( () => {
    setNumFetchIntervals( numFetchIntervals + 1 );
  }, 60_000 );

  return (
    <NotificationsIcon
      icon={icon}
      unread={hasUnread}
      active={active}
      size={size}
      testID={testID}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      width={width}
      height={height}
    />
  );
};

export default NotificationsIconContainer;
