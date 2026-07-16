import { useNavigation } from "@react-navigation/native";
import { POST_FOR_PROJECT_FIELDS } from "api/fields";
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

interface Props {
  userIcon?: string;
  userId: number;
  userLogin?: string;
}

const ProjectPosts = ( {
  userIcon,
  userId,
  userLogin,
}: Props ) => {
  const navigation
    = useNavigation<TabStackScreenProps<"Journal">["navigation"]>();
  const { t } = useTranslation();

  const queryKey = ["fetchUserPosts", userId];
  const queryParams = {
    id: userId,
    fields: POST_FOR_PROJECT_FIELDS,
  };

  const {
    data: userPosts,
    fetchNextPage,
    isFetchingNextPage,
    totalResults: totalPosts,
  } = useInfiniteScroll( queryKey, fetchUserPosts, queryParams, {
    enabled: !!userId,
  } );

  const headerOptions = useMemo(
    () => ( {
      headerTitle: userLogin,
      headerSubtitle: t( "X-JOURNAL_POSTS", {
        count: totalPosts || 0,
      } ),
    } ),
    [totalPosts, t, userLogin],
  );

  useEffect( () => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  const enrichedPosts = useMemo( () => {
    if ( !userPosts ) return null;

    return userPosts?.map( p => ( {
      ...p,
      parent: {
        id: userId,
        icon_url: userIcon,
      },
    } ) );
  }, [userIcon, userId, userPosts] );

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
