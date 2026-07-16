import { useNavigation } from "@react-navigation/native";
import { POST_FOR_PROJECT_FIELDS } from "api/fields";
import { fetchProjectPosts } from "api/posts";
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

interface Props {
  projectIcon?: string;
  projectId?: number;
  projectTitle?: string;
}

const ProjectPosts = ( {
  projectIcon,
  projectId,
  projectTitle,
}: Props ) => {
  const navigation
    = useNavigation<TabStackScreenProps<"Journal">["navigation"]>();
  const { t } = useTranslation();

  const queryKey = ["fetchProjectPosts", projectId];
  const queryParams = {
    id: projectId,
    fields: POST_FOR_PROJECT_FIELDS,
  };

  const {
    data: projectPosts,
    fetchNextPage,
    isFetchingNextPage,
    totalResults: totalPosts,
  } = useInfiniteScroll( queryKey, fetchProjectPosts, queryParams, {
    enabled: !!projectId,
  } );

  const headerOptions = useMemo(
    () => ( {
      headerTitle: projectTitle,
      headerSubtitle: t( "X-JOURNAL_POSTS", {
        count: totalPosts || 0,
      } ),
    } ),
    [totalPosts, t, projectTitle],
  );

  useEffect( () => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  const enrichedPosts = useMemo( () => {
    if ( !projectPosts ) return null;

    return projectPosts?.map( p => ( {
      ...p,
      parent: {
        id: projectId,
        icon_url: projectIcon,
      },
    } ) );
  }, [projectIcon, projectId, projectPosts] );

  return (
    <ScreenShell>
      <PostList
        posts={enrichedPosts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </ScreenShell>
  );
};

export default ProjectPosts;
