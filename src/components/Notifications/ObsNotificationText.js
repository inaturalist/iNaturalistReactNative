// @flow
import {
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";

    type Props = {
        type: string,
        notifier: string
    };

const ObsNotificationText = ( { type, notifier }: Props ): Node => {
  const { t } = useTranslation( );

  const renderNotifierUsername = () => (
    <List2 className="font-bold pr-[2px]">{ notifier }</List2> );

  if ( type === "Identification" ) {
    return (
      <View className="flex-row">
        <List2>
          {renderNotifierUsername()}
          {" "}
          {t( "Notification-Identification" )}
        </List2>
      </View>
    );
  }

  if ( type === "Comment" ) {
    return (
      <View className="flex-row">
        <List2>
          {renderNotifierUsername()}
          {" "}
          {t( "Notification-Comment" )}
        </List2>
      </View>
    );
  }

  return (
    <View className="flex-row">
      <List2>
        {renderNotifierUsername()}
        {t( "Notification-Mention" )}
      </List2>
    </View>
  );
};

export default ObsNotificationText;
