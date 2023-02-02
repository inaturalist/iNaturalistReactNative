// @flow

import INatIcon from "components/INatIcon";
import Body3 from "components/SharedComponents/Typography/Body3";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { t } from "i18next";

type Props = {
  numOfComments: number,
  color: string,
  icon?: string
}

const ActivityCount = ( { numOfComments, color, icon }: Props ): Node => (
  <View
    className="flex-row items-center"
    accessible
    accessibilityLabel={t( "Number-of-comments" )}
    accessibilityValue={{ text: numOfComments.toString() }}
  >
    <INatIcon
      name={icon || "comments-filled-in"}
      color={color}
      size={14}
    />
    <Body3
      className="ml-1.5"
      testID="ActivityCount.commentCount"
      style={{ color }}
    >
      {numOfComments}
    </Body3>
  </View>
);

export default ActivityCount;
