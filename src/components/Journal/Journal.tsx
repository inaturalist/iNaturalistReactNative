import { useRoute } from "@react-navigation/native";
import type { TabStackScreenProps } from "navigation/types";
import React from "react";

import Blog from "./Blog";

const Journal = ( ) => {
  const { params } = useRoute<TabStackScreenProps<"Journal">["route"]>( );
  const {
    journalPostsCount, projectIcon, projectId, projectTitle, userLogin,
  } = params || {};

  if ( projectId ) {
    console.log( "journalPostsCount", journalPostsCount );
    console.log( "projectIcon", projectIcon );
    console.log( "projectId", projectId );
    console.log( "projectTitle", projectTitle );
  }

  if ( userLogin ) {
    return null;
  }

  return (
    <Blog />
  );
};

export default Journal;
