import {
  List2
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { Trans } from "react-i18next";

type Props = {
  type: string,
  userName: string
};

const ObsNotificationText = ( { type, userName }: Props ) => {
  let content: string | React.ReactElement = `unknown notification type: ${type}`;

  if ( type === "Comment" ) {
    content = (
      <Trans
        i18nKey="notifications-user-added-comment-to-observation-by-you"
        values={{ userName }}
        components={[
          <List2 className="font-bold pr-[2px]" />
        ]}
      />
    );
  } else if ( type === "Identification" ) {
    content = (
      <Trans
        i18nKey="notifications-user-added-identification-to-observation-by-you"
        values={{ userName }}
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
