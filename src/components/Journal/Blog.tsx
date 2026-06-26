import { useNavigation } from "@react-navigation/native";
import { POST_FOR_USER_FIELDS } from "api/fields";
import { fetchUserPosts } from "api/posts";
import type { ApiPostForUser } from "api/types";
import ActivityIndicator from "components/SharedComponents/ActivityIndicator";
import { ScreenShell } from "components/SharedComponents/ViewWrapper";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import React, {
  useEffect,
  useMemo,
} from "react";
import {
  useTranslation,
} from "sharedHooks";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

import PostList from "./PostList";

const Blog = ( ) => {
  const navigation = useNavigation<TabStackScreenProps<"Journal">["navigation"]>( );
  const { t } = useTranslation( );

  const headerOptions = useMemo(
    () => ( {
      headerTitle: t( "Blog" ),
      headerSubtitle: t( "X-JOURNAL_POSTS", {
        count: 0,
      } ),
    } ),
    [t],
  );

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  const {
    data: postsForUser,
    isLoading: isLoadingPostsForUser,
  } = useAuthenticatedQuery<ApiPostForUser[]>(
    ["fetchUserPosts"],
    optsWithAuth => fetchUserPosts( {
      fields: POST_FOR_USER_FIELDS,
    }, optsWithAuth ),
  );

  if ( isLoadingPostsForUser ) {
    return (
      <View className="flex-1 bg-white">
        <ActivityIndicator size={50} />
      </View>
    );
  }

  if ( !postsForUser ) {
    return null;
  }

  return (
    <ScreenShell>
      <View className="border-b border-lightGray mt-5" />
      <PostList posts={postsForUser} />
    </ScreenShell>
  );
};

export default Blog;
