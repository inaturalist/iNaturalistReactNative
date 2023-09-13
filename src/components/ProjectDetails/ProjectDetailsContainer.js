// @flow

import { useRoute } from "@react-navigation/native";
import { fetchProjects } from "api/projects";
import type { Node } from "react";
import React from "react";
import { useAuthenticatedQuery } from "sharedHooks";

import ProjectDetails from "./ProjectDetails";

const ProjectDetailsContainer = ( ): Node => {
  const { params } = useRoute( );
  const { id } = params;

  const { data: project } = useAuthenticatedQuery(
    ["fetchProjects", id],
    optsWithAuth => fetchProjects( id, {}, optsWithAuth )
  );

  return (
    <ProjectDetails project={project} />
  );
};

export default ProjectDetailsContainer;
