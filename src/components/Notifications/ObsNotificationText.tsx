import {
  List2,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";
import { useTranslation } from "sharedHooks";
import type { Notification } from "sharedHooks/useInfiniteNotificationsScroll";

interface Props {
  notification: Notification;
}

const ObsNotificationText = ( { notification }: Props ) => {
  const { t } = useTranslation( );
  const { identification, comment, notifier_type: type } = notification;
  const { user: notifierUser } = identification || comment || {};
  if ( !notifierUser ) {
    throw new Error( "Notification must have a user" );
  }
  let content: string | React.ReactElement<typeof Trans> = `unknown notification type: ${type}`;
  const resourceOwner = notification.resource?.user;

  const transComponents = [<List2 key="0" className="font-bold pr-[2px]" />];
  if ( notification.viewerOwnsResource ) {
    const transValues = { userName: notifierUser.login };
    if ( type === "Comment" ) {
      content = (
        <Trans
          i18nKey="notifications-user-added-comment-to-observation-by-you"
          values={transValues}
          components={transComponents}
        />
      );
    } else if ( type === "Identification" ) {
      content = (
        <Trans
          i18nKey="notifications-user-added-identification-to-observation-by-you"
          values={transValues}
          components={transComponents}
        />
      );
    }
  } else {
    const transValues = {
      user1: notifierUser.login,
      user2: resourceOwner?.login || t( "Unknown--user" ),
    };
    if ( type === "Comment" ) {
      content = (
        <Trans
          i18nKey="notifications-user1-added-comment-to-observation-by-user2"
          values={transValues}
          components={transComponents}
        />
      );
    } else if ( type === "Identification" ) {
      content = (
        <Trans
          i18nKey="notifications-user1-added-identification-to-observation-by-user2"
          values={transValues}
          components={transComponents}
        />
      );
    }
  }

  return (
    <View className="flex-row">
      <List2>
        { content }
      </List2>
    </View>
  );
};

export default ObsNotificationText;
