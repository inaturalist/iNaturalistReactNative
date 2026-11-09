import { useRoute } from "@react-navigation/native";
import { POST_DETAILS } from "api/fields";
import { fetchPost } from "api/posts";
import type { ApiPost } from "api/types";
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
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

const PostDetails = ( ) => {
  const { params } = useRoute<TabStackScreenProps<"PostDetails">["route"]>( );
  const { id } = params;
  console.log( "id", id );
  const {
    body,
    // eslint-disable-next-line camelcase
    published_at,
    title,
  } = params;
  const { i18n } = useTranslation( );
  const {
    data: post,
  } = useAuthenticatedQuery<ApiPost>(
    ["fetchPost", id],
    optsWithAuth => {
      const params = {
        id,
        fields: POST_DETAILS,
      };
      return fetchPost( params, optsWithAuth );
    },
  );
  console.log( "post", post );

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
