import { useNavigation, useRoute } from "@react-navigation/native";
import {
  Body1,
  List2,
  ScrollViewWrapper,
} from "components/SharedComponents";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import React, { useEffect } from "react";
import { formatLongDate } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

const PostDetails = ( ) => {
  const navigation = useNavigation<TabStackScreenProps<"PostDetails">["navigation"]>( );
  const { params } = useRoute<TabStackScreenProps<"PostDetails">["route"]>( );
  const {
    body,
    headerTitle,
    // eslint-disable-next-line camelcase
    published_at,
    title,
  } = params;
  const { i18n } = useTranslation( );
  console.log( "body", body );
  useEffect( ( ) => {
    navigation.setOptions( { headerTitle } );
  }, [headerTitle, navigation] );

  return (
    <ScreenShell>
      <ScrollViewWrapper testID="PostDetails">
        <View className="mx-4 my-5">
          <View className="mb-2 flex-row justify-between">
            <View />
            <List2>{formatLongDate( published_at, i18n )}</List2>
          </View>
          <Body1>{title}</Body1>
        </View>
      </ScrollViewWrapper>
    </ScreenShell>
  );
};

export default PostDetails;
