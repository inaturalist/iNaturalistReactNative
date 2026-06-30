import { RealmContext } from "providers/contexts";
import { useMemo } from "react";
import Project from "realmModels/Project";

const { useQuery } = RealmContext;

const useJoinedTraditionalProjects = ( ) => {
  const projects = useQuery(
    {
      type: Project,
      query: projects => projects
        // \"\" project type for traditional projects is an empty string
        .filtered( "project_type == \"\" OR project_type == null" ),
    },
    [],
  );

  return useMemo(
    ( ) => projects,
    [projects],
  );
};

export default useJoinedTraditionalProjects;
