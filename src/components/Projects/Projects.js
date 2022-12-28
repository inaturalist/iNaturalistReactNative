// @flow

import InputField from "components/SharedComponents/InputField";
import ViewWithFooter from "components/SharedComponents/ViewWithFooter";
import type { Node } from "react";
import React, { useEffect, useState } from "react";

import ProjectSearch from "./ProjectSearch";
import ProjectTabs from "./ProjectTabs";

const Projects = ( ): Node => {
  const [q, setQ] = useState( "" );
  const [view, setView] = useState( "tabs" );

  const clearSearch = ( ) => setQ( "" );

  useEffect( ( ) => {
    if ( q.length > 0 ) {
      setView( "search" );
    } else {
      setView( "tabs" );
    }
  }, [q] );

  return (
    <ViewWithFooter testID="Projects">
      <InputField
        handleTextChange={setQ}
        placeholder="search for projects"
        text={q}
        type="none"
        testID="ProjectSearch.input"
      />
      {view === "tabs"
        ? <ProjectTabs />
        : <ProjectSearch q={q} clearSearch={clearSearch} />}
    </ViewWithFooter>
  );
};

export default Projects;
