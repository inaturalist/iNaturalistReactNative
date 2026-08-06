import {
  Body1,
  List2,
  ScrollViewWrapper,
} from "components/SharedComponents";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import React, { useEffect } from "react";
import { formatLongDate } from "sharedHelpers/dateAndTime";
import { useTranslation } from "sharedHooks";

const PostDetails = ( ) => {
  console.log( "useEffect", useEffect );
  const { i18n } = useTranslation( );
  const title = "testgin a very long title looks pretty awesome with this new s component!";
  const date = new Date( ).toISOString( );
  return (
    <ScreenShell>
      <ScrollViewWrapper testID="PostDetails">
        <View className="mx-4 my-5">
          <View className="mb-2 flex-row justify-between">
            <View />
            <List2>
              {formatLongDate( date, i18n )}
            </List2>
          </View>
          <Body1>{title}</Body1>
        </View>
      </ScrollViewWrapper>
    </ScreenShell>
  );
};

export default PostDetails;
