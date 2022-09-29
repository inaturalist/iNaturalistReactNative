// @flow

import PlaceholderText from "components/PlaceholderText";
import * as React from "react";
import { Pressable } from "react-native";

import useRemoteSearchResults from "../../sharedHooks/useRemoteSearchResults";
import ProjectList from "./ProjectList";

type Props = {
  q: string,
  clearSearch: Function
}

const ProjectSearch = ( { q, clearSearch }: Props ): React.Node => {
  const projectSearchResults = useRemoteSearchResults( q, "projects", "all" );

  if ( q === "" ) {
    return null;
  }

  return (
    <>
      <Pressable
        onPress={clearSearch}
      >
        <PlaceholderText text="cancel search" />
      </Pressable>
      <ProjectList data={projectSearchResults} />
    </>
  );
};

export default ProjectSearch;
