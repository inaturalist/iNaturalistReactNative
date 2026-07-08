import { useNavigation } from "@react-navigation/native";
import { POST_FOR_USER_FIELDS } from "api/fields";
import { fetchUserPosts } from "api/posts";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import type { TabStackScreenProps } from "navigation/types";
import React, {
  useEffect,
  useMemo,
} from "react";
import {
  useInfiniteScroll,
  useTranslation,
} from "sharedHooks";

import PostList from "./PostList";

const Blog = ( ) => {
  const navigation = useNavigation<TabStackScreenProps<"Journal">["navigation"]>( );
  const { t } = useTranslation( );

  const queryKey = ["fetchUserPosts"];
  const queryParams = {
    fields: POST_FOR_USER_FIELDS,
  };

  const {
    data: blogPosts,
    fetchNextPage,
    isFetchingNextPage,
    totalResults: totalPosts,
  } = useInfiniteScroll( queryKey, fetchUserPosts, queryParams, {
    enabled: true,
  } );

  const headerOptions = useMemo(
    () => ( {
      headerTitle: t( "Blog" ),
      headerSubtitle: t( "X-JOURNAL_POSTS", {
        count: totalPosts || 0,
      } ),
    } ),
    [t, totalPosts],
  );

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  if ( !blogPosts ) {
    return null;
  }

  return (
    <ScreenShell>
      <PostList
        posts={blogPosts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </ScreenShell>
  );
};

export default Blog;
