// @flow

import fetchSearchResults from "api/search";
import PlaceholderText from "components/PlaceholderText";
import * as React from "react";
import { Pressable } from "react-native";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

import ProjectList from "./ProjectList";

type Props = {
  q: string,
  clearSearch: Function
}

const ProjectSearch = ( { q, clearSearch }: Props ): React.Node => {
  const {
    data: projectSearchResults
  } = useAuthenticatedQuery(
    ["fetchSearchResults", q],
    optsWithAuth => fetchSearchResults( {
      q,
      sources: "projects"
    }, optsWithAuth )
  );

  if ( q === "" ) {
    return null;
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={clearSearch}
      >
        <PlaceholderText text="cancel search" />
      </Pressable>
      <ProjectList data={projectSearchResults} />
    </>
  );
};

export default ProjectSearch;
