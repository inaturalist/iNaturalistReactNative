import { useRoute } from "@react-navigation/native";
import type { TabStackScreenProps } from "navigation/types";
import React from "react";

import Blog from "./Blog";
import ProjectPosts from "./ProjectPosts";
import UserPosts from "./UserPosts";

const Journal = ( ) => {
  const { params } = useRoute<TabStackScreenProps<"Journal">["route"]>( );
  const {
    projectIcon, projectId, projectTitle, userIcon, userId, userLogin,
  } = params || {};

  if ( projectId ) {
    return (
      <ProjectPosts
        projectIcon={projectIcon}
        projectId={projectId}
        projectTitle={projectTitle}
      />
    );
  }

  if ( userId ) {
    return (
      <UserPosts
        userIcon={userIcon}
        userId={userId}
        userLogin={userLogin}
      />
    );
  }

  return (
    <Blog />
  );
};

export default Journal;
