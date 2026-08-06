import {
  Body1,
  ScrollViewWrapper,
} from "components/SharedComponents";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import React, { useEffect } from "react";

const PostDetails = ( ) => {
  console.log( "useEffect", useEffect );
  const title = "testgin a very long title looks pretty awesome with this new s component!";
  return (
    <ScreenShell>
      <ScrollViewWrapper testID="PostDetails">
        <View className="mx-4 my-5">
          <Body1>{title}</Body1>
        </View>
      </ScrollViewWrapper>
    </ScreenShell>
  );
};

export default PostDetails;
