// @flow

import { useRoute } from "@react-navigation/native";
import { fetchSpeciesCounts, searchObservations } from "api/observations";
import {
  fetchMembership,
  fetchProjectMembers, fetchProjectPosts, fetchProjects, joinProject, leaveProject
} from "api/projects";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useAuthenticatedMutation, useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

import ProjectDetails from "./ProjectDetails";

const ProjectDetailsContainer = ( ): Node => {
  const { params } = useRoute( );
  const { id } = params;
  const currentUser = useCurrentUser( );
  const [loading, setLoading] = useState( false );

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

  const { data: currentMembership, refetch, isRefetching } = useAuthenticatedQuery(
    ["fetchMembership", id],
    optsWithAuth => fetchMembership( {
      id
    }, optsWithAuth ),
    {
      enabled: !!( currentUser )
    }
  );

  const createJoinProjectMutation = useAuthenticatedMutation(
    ( joinParams, optsWithAuth ) => joinProject( joinParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        refetch( );
      },
      onError: error => {
        console.log( error, "couldn't join project" );
      }
    }
  );

  const createLeaveProjectMutation = useAuthenticatedMutation(
    ( leaveParams, optsWithAuth ) => leaveProject( leaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        refetch( );
      },
      onError: error => {
        console.log( error, "couldn't leave project" );
      }
    }
  );

  useEffect( ( ) => {
    if ( isRefetching === false ) {
      setLoading( false );
    }
  }, [isRefetching] );

  if ( project ) {
    project.members_count = projectMembers;
    project.journal_posts_count = projectPosts;
    project.observations_count = projectStats?.total_results;
    project.species_count = speciesCounts?.total_results;
    project.current_user_is_member = currentMembership === 1;
  }

  return (
    <ProjectDetails
      project={project}
      joinProject={( ) => {
        setLoading( true );
        createJoinProjectMutation.mutate( { id } );
      }}
      leaveProject={( ) => {
        setLoading( true );
        createLeaveProjectMutation.mutate( { id } );
      }}
      loadingProjectMembership={loading}
    />
  );
};

export default ProjectDetailsContainer;
