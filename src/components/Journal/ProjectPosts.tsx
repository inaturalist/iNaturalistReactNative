import { useNavigation } from "@react-navigation/native";
import { POST_FOR_PROJECT_FIELDS } from "api/fields";
import { fetchProjectPosts } from "api/posts";
import type { ApiPostForProject } from "api/types";
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

interface Props {
  journalPostsCount?: number;
  projectIcon?: string;
  projectId?: number;
  projectTitle?: string;
}

const PostsForProjects = ( {
  journalPostsCount,
  projectIcon,
  projectId,
  projectTitle,
}: Props ) => {
  const navigation
    = useNavigation<TabStackScreenProps<"Journal">["navigation"]>();
  const { t } = useTranslation();

  const headerOptions = useMemo(
    () => ( {
      headerTitle: projectTitle,
      headerSubtitle: t( "X-JOURNAL_POSTS", {
        count: journalPostsCount || 0,
      } ),
    } ),
    [journalPostsCount, t, projectTitle],
  );

  useEffect( () => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  const { data: postsForProject, isLoading: isLoadingPostsForProject }
    = useAuthenticatedQuery<ApiPostForProject[]>(
      ["fetchProjectPosts", projectId],
      optsWithAuth => fetchProjectPosts(
        {
          id: projectId,
          fields: POST_FOR_PROJECT_FIELDS,
        },
        optsWithAuth,
      ),
      { enabled: !!projectId },
    );

  const enrichedPosts = useMemo( () => {
    if ( !postsForProject ) return null;

    return postsForProject?.map( p => ( {
      ...p,
      parent: {
        id: projectId,
        icon_url: projectIcon,
      },
    } ) );
  }, [projectIcon, projectId, postsForProject] );

  if ( isLoadingPostsForProject ) {
    return (
      <View className="flex-1 bg-white">
        <ActivityIndicator size={50} />
      </View>
    );
  }

  return (
    <ScreenShell>
      <View className="border-b border-lightGray mt-5" />
      <PostList posts={enrichedPosts} />
    </ScreenShell>
  );
};

export default PostsForProjects;
