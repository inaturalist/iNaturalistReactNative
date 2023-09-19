// @flow

import { useRoute } from "@react-navigation/native";
import { fetchSpeciesCounts, searchObservations } from "api/observations";
import { fetchProjectMembers, fetchProjectPosts, fetchProjects } from "api/projects";
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

  const { data: projectMembers } = useAuthenticatedQuery(
    ["fetchProjectMembers", id],
    optsWithAuth => fetchProjectMembers( {
      id,
      order_by: "login"
    }, optsWithAuth )
  );

  const { data: projectPosts } = useAuthenticatedQuery(
    ["fetchProjectPosts", id],
    optsWithAuth => fetchProjectPosts( {
      id
    }, optsWithAuth )
  );

  const { data: projectStats } = useAuthenticatedQuery(
    ["searchObservations", id],
    ( ) => searchObservations( {
      project_id: id
    } )
  );

  const { data: speciesCounts } = useAuthenticatedQuery(
    ["fetchSpeciesCounts", id],
    ( ) => fetchSpeciesCounts( {
      project_id: id
    } )
  );

  if ( project ) {
    project.members_count = projectMembers;
    project.journal_posts_count = projectPosts;
    project.observations_count = projectStats?.total_results;
    project.species_count = speciesCounts?.total_results;
  }

  return (
    <ProjectDetails
      project={project}
    />
  );
};

export default ProjectDetailsContainer;
