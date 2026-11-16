import { useNetInfo } from "@react-native-community/netinfo";
import { useRoute } from "@react-navigation/native";
import { POST_DETAILS } from "api/fields";
import { fetchPost } from "api/posts";
import type { ApiPost } from "api/types";
import {
  ActivityIndicator,
  Body1,
  List2,
  OfflineNotice,
  ScrollViewWrapper,
  UserText,
} from "components/SharedComponents";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { NoBottomTabStackScreenProps, TabStackScreenProps } from "navigation/types";
import React from "react";
import { formatLongDate } from "sharedHelpers/dateAndTime";
import { useAuthenticatedQuery, useTranslation } from "sharedHooks";

const PostDetails = ( ) => {
  const { params } = useRoute<
    NoBottomTabStackScreenProps<"PostDetails">["route"] &
    TabStackScreenProps<"PostDetails">["route"]
  >( );
  const { id } = params;
  const { isConnected } = useNetInfo( );
  const { i18n, t } = useTranslation( );

  const {
    data: post,
    error,
    isError,
    isLoading,
    refetch,
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

  if ( isConnected === false || error?.message?.match( /Network request failed/ ) ) {
    return (
      <ScreenShell testID="PostDetails.offline">
        <View className="flex-1 justify-center items-center">
          <OfflineNotice onPress={refetch} />
        </View>
      </ScreenShell>
    );
  }

  if ( isLoading ) {
    return (
      <ScreenShell testID="PostDetails.loading">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size={50} />
        </View>
      </ScreenShell>
    );
  }

  if ( isError || post === null || post === undefined ) {
    return (
      <ScreenShell testID="PostDetails.error">
        <View className="flex-1 justify-center items-center">
          <Body1>{t( "Something-went-wrong" )}</Body1>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <ScrollViewWrapper testID="PostDetails">
        <View className="mx-4 my-5">
          <View className="mb-2 flex-row justify-between">
            <View />
            <List2>{formatLongDate( post.published_at, i18n )}</List2>
          </View>
          <Body1>{post.title}</Body1>
          {/* 32 = mx-4 (16 on either side) */}
          <UserText text={post.body} contentMargin={32} />
        </View>
      </ScrollViewWrapper>
    </ScreenShell>
  );
};

export default PostDetails;
