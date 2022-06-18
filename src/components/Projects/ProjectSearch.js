// @flow

import * as React from "react";
import { Pressable, Text } from "react-native";

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
        <Text>cancel search</Text>
      </Pressable>
      <ProjectList data={projectSearchResults} />
    </>
  );
};

export default ProjectSearch;
