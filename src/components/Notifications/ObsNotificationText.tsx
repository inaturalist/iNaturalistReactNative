import {
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";
import type { Notification } from "sharedHooks/useInfiniteNotificationsScroll";

interface Props {
  notification: Notification
}

const ObsNotificationText = ( { notification }: Props ) => {
  const { identification, comment, notifier_type: type } = notification;
  const { user } = identification || comment || {};
  if ( !user ) {
    throw new Error( "Notification must have a user" );
  }
  let content: string | React.ReactElement = `unknown notification type: ${type}`;

  const resourceOwner = notification.resource?.user;
  console.log( "[DEBUG ObsNotificationText.tsx] resourceOwner?.login: ", resourceOwner?.login );
  // TODO use this to determine who the observation is "by"

  if ( type === "Comment" ) {
    content = (
      <Trans
        i18nKey="notifications-user-added-comment-to-observation-by-you"
        values={{ userName: user.login }}
        components={[
          <List2 className="font-bold pr-[2px]" />
        ]}
      />
    );
  } else if ( type === "Identification" ) {
    content = (
      <Trans
        i18nKey="notifications-user-added-identification-to-observation-by-you"
        values={{ userName: user.login }}
        components={[
          <List2 className="font-bold pr-[2px]" />
        ]}
      />
    );
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
