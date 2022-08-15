// @flow

import * as React from "react";

import InputField from "../SharedComponents/InputField";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import ProjectSearch from "./ProjectSearch";
import ProjectTabs from "./ProjectTabs";

const Projects = ( ): React.Node => {
  const [q, setQ] = React.useState( "" );

  const clearSearch = ( ) => setQ( "" );

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
      <ProjectTabs />
      <ProjectSearch q={q} clearSearch={clearSearch} />
    </ViewWithFooter>
  );
};

export default Projects;
