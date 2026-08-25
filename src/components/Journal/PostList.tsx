import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import type { ListRenderItem } from "@shopify/flash-list";
import type { ApiPostForUser } from "api/types";
import {
  ActivityIndicator,
  CustomFlashList,
  InfiniteScrollLoadingWheel,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import React, { useCallback, useMemo } from "react";

import PostListItem from "./PostListItem";

const CONTAINER_STYLE = {
  backgroundColor: "white",
};

const ItemSeparator = () => <View className="border-b border-lightGray" />;

interface Props {
  posts: ApiPostForUser[];
  isFetchingNextPage: boolean;
  fetchNextPage: ( ) => void;
}

const PostList = ( {
  posts,
  isFetchingNextPage,
  fetchNextPage,
}: Props ) => {
  const navigation = useNavigation<TabStackScreenProps<"Journal">["navigation"]>( );
  const { isConnected } = useNetInfo();
  const footerComponent = useMemo(
    () => (
      <InfiniteScrollLoadingWheel
        hideLoadingWheel={!isFetchingNextPage}
        layout="list"
        isConnected={isConnected}
      />
    ),
    [isConnected, isFetchingNextPage],
  );

  const emptyComponent = useMemo( () => <ActivityIndicator size={50} />, [] );

  const onPressPost = useCallback( ( post: ApiPostForUser ) => {
    navigation.navigate( "PostDetails", {
      body: post.body,
      published_at: post.published_at,
      title: post.title,
    } );
  }, [navigation] );

  const renderPost: ListRenderItem<ApiPostForUser> = useCallback(
    ( { item } ) => <PostListItem item={item} onPress={onPressPost} />,
    [onPressPost],
  );

  return (
    <CustomFlashList
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={emptyComponent}
      ListFooterComponent={footerComponent}
      contentContainerStyle={CONTAINER_STYLE}
      data={posts}
      keyExtractor={item => String( item.id )}
      onEndReached={fetchNextPage}
      refreshing={isFetchingNextPage}
      renderItem={renderPost}
      testID="PostList"
    />
  );
};

export default PostList;
