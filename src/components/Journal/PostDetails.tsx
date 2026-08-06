import {
  ScrollViewWrapper,
} from "components/SharedComponents";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import React, { useEffect } from "react";

const PostDetails = ( ) => {
  console.log( "useEffect", useEffect );
  return (
    <ScreenShell>
      <ScrollViewWrapper testID="PostDetails" />
    </ScreenShell>
  );
};

export default PostDetails;
