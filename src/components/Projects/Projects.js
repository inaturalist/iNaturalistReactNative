// @flow

import { fetchUserMe } from "api/users";
import InputField from "components/SharedComponents/InputField";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import * as React from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

import ProjectSearch from "./ProjectSearch";
import ProjectTabs from "./ProjectTabs";

const Projects = ( ): React.Node => {
  const [q, setQ] = React.useState( "" );

  const clearSearch = ( ) => setQ( "" );

  const {
    data: user
  } = useAuthenticatedQuery(
    ["fetchUserMe"],
    optsWithAuth => fetchUserMe( { }, optsWithAuth )
  );

  const memberId = user?.id;

  return (
    <ViewWithFooter testID="Projects">
      <InputField
        handleTextChange={setQ}
        placeholder="search for projects"
        text={q}
        type="none"
        testID="ProjectSearch.input"
      />
      {/* TODO: make project search a separate screen or a modal?
      not sure what the final designs will look like but unlikely
      tabs and search will both be on the same screen */}
      {memberId && <ProjectTabs memberId={memberId} />}
      <ProjectSearch q={q} clearSearch={clearSearch} />
    </ViewWithFooter>
  );
};

export default Projects;
