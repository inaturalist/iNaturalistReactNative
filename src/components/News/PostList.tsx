import type { ListRenderItem } from "@shopify/flash-list";
import type { ApiPost } from "api/types";
import { CustomFlashList } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";

import PostListItem from "./PostListItem";

const ItemSeparator = () => <View className="border-b border-lightGray" />;

interface Props {
  posts: ApiPost[];
}

const PostList = ( {
  posts,
}: Props ) => {
  const renderPost: ListRenderItem<ApiPost> = ( { item } ) => (
    <PostListItem item={item} />
  );

  return (
    <CustomFlashList
      ItemSeparatorComponent={ItemSeparator}
      data={posts}
      keyExtractor={item => String( item.id )}
      renderItem={renderPost}
      testID="PostList"
    />
  );
};

export default PostList;
