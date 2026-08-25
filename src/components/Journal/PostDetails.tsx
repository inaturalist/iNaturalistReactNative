import { useRoute } from "@react-navigation/native";
import {
  Body1,
  List2,
  ScrollViewWrapper,
  UserText,
} from "components/SharedComponents";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import React from "react";
import { formatLongDate } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

const PostDetails = ( ) => {
  const { params } = useRoute<TabStackScreenProps<"PostDetails">["route"]>( );
  const {
    body,
    // eslint-disable-next-line camelcase
    published_at,
    title,
  } = params;
  const { i18n } = useTranslation( );

  return (
    <ScreenShell>
      <ScrollViewWrapper testID="PostDetails">
        <View className="mx-4 my-5">
          <View className="mb-2 flex-row justify-between">
            <View />
            <List2>{formatLongDate( published_at, i18n )}</List2>
          </View>
          <Body1>{title}</Body1>
          {/* 32 = mx-4 (16 on either side) */}
          <UserText text={body} contentMargin={32} />
        </View>
      </ScrollViewWrapper>
    </ScreenShell>
  );
};

export default PostDetails;
