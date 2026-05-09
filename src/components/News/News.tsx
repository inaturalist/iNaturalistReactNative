import fetchUserPosts from "api/posts";
import ActivityIndicator from "components/SharedComponents/ActivityIndicator";
import { View } from "components/styledComponents";
import React from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";

import PostList from "./PostList";

const News = ( ) => {
  const currentUser = useCurrentUser( );
  const { data: posts, isLoading: isLoadingPosts } = useAuthenticatedQuery(
    ["fetchUserPosts"],
    optsWithAuth => fetchUserPosts(
      {},
      optsWithAuth,
    ),
    { enabled: !!currentUser },
  );

  if ( isLoadingPosts ) {
    return (
      <View className="flex-1 bg-white">
        <ActivityIndicator size={50} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <PostList posts={posts} />
    </View>
  );
};

export default News;
