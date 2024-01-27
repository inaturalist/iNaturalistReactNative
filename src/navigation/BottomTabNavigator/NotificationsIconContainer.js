// @flow
import { fetchNotificationCounts } from "api/users";
import NotificationsIcon from "navigation/BottomTabNavigator/NotificationsIcon";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useInterval } from "sharedHooks";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

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
  /* eslint-disable react/jsx-props-no-spreading */
  const sharedProps = {
    testID,
    onPress,
    accessibilityRole,
    accessibilityLabel,
    accessibilityHint,
    width,
    height
  };

  const [hasUnread, setHasUnread] = useState( false );
  const { mutate } = useAuthenticatedMutation(
    ( params, optsWithAuth ) => fetchNotificationCounts( params, optsWithAuth ),
    {
      onSuccess: response => {
        if ( response.updates_count > 0 ) {
          setHasUnread( true );
        } else {
          setHasUnread( false );
        }
      }
    }
  );

  useEffect( () => {
    mutate( {} );
  }, [mutate] );

  useInterval( () => {
    mutate( {} );
  }, 60000 );

  return (
    <NotificationsIcon
      icon={icon}
      unread={hasUnread}
      active={active}
      size={size}
      {...sharedProps}
    />
  );
};

export default NotificationsIconContainer;
