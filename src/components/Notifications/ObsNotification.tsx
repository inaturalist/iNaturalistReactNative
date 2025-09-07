import ObservationIcon from "components/Notifications/ObservationIcon";
import ObsNotificationText from "components/Notifications/ObsNotificationText";
import {
  Body4,
  INatIcon
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { formatDifferenceForHumans } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";
import type { Notification } from "sharedHooks/useInfiniteNotificationsScroll";
import colors from "styles/tailwindColors";

interface Props {
  notification: Notification
}

const ObsNotification = ( { notification }: Props ) => {
  const { i18n } = useTranslation( );
  const { notifier_type: type } = notification;

  const renderIcon = () => {
    switch ( type ) {
      case "Identification":
        return "label-outline";
      case "Comment":
        return "comments-outline";
      default:
        return "";
    }
  };
  return (
    <View
      className="shrink flex-row space-x-[10px]"
    >
      <ObservationIcon observation={notification.resource} />
      <View className="flex-col shrink justify-center space-y-[8px]">
        <ObsNotificationText notification={notification} />
        <View className="flex-row space-x-[8px]">
          {
            type
              && (
                <INatIcon
                  name={renderIcon( )}
                  size={14}
                  color={String( colors?.darkGray )}
                />
              )
          }
          {notification.created_at
            && (
              <Body4>
                {formatDifferenceForHumans( notification.created_at, i18n )}
              </Body4>
            )}
        </View>
      </View>
    </View>
  );
};

export default ObsNotification;
