import type { ApiPost } from "api/types";
import {
  Body1,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

interface Props {
  item?: ApiPost | null;
}

const PostListItem = ( { item }: Props ) => {
  if ( !item ) { return null; }

  return (
    <View
      className="flex-row items-center shrink py-1"
    >
      <View className="shrink ml-3">
        <Body1>{item.title}</Body1>
        <Body1>{item.body}</Body1>
      </View>
    </View>
  );
};

export default PostListItem;
