import { useRoute } from "@react-navigation/native";
import type { TabStackScreenProps } from "navigation/types";
import React from "react";

import Blog from "./Blog";
import PostsForProjects from "./PostsForProjects";

const Journal = ( ) => {
  const { params } = useRoute<TabStackScreenProps<"Journal">["route"]>( );
  const {
    journalPostsCount, projectIcon, projectId, projectTitle, userLogin,
  } = params || {};

  if ( projectId ) {
    return (
      <PostsForProjects
        journalPostsCount={journalPostsCount}
        projectIcon={projectIcon}
        projectId={projectId}
        projectTitle={projectTitle}
      />
    );
  }

  // TODO: posts for one user
  if ( userLogin ) {
    return null;
  }

  return (
    <Blog />
  );
};

export default Journal;
