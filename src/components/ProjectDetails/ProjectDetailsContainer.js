// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSpeciesCounts, searchObservations } from "api/observations";
import fetchPlace from "api/places";
import {
  fetchMembership,
  fetchProjectMembers, fetchProjectPosts, fetchProjects, joinProject, leaveProject
} from "api/projects";
import type { Node } from "react";
import React, { useMemo, useState } from "react";
import User from "realmModels/User.ts";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedMutation, useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

import ProjectDetails from "./ProjectDetails";

const logger = log.extend( "ProjectDetailsContainer" );

const ProjectDetailsContainer = ( ): Node => {
  const navigation = useNavigation( );
  const { params } = useRoute( );
  const { id } = params;
  const currentUser = useCurrentUser( );
  const [loading, setLoading] = useState( false );

  const fetchProjectsQueryKey = ["projectDetails", "fetchProjects", id];

  const { data: project } = useAuthenticatedQuery(
    fetchProjectsQueryKey,
    optsWithAuth => fetchProjects( id, {
      fields: {
        id: true,
        title: true,
        icon: true,
        header_image_url: true,
        project_type: true,
        description: true,
        current_user_is_member: true
      }
    }, optsWithAuth )
  );

  const fetchProjectPlaceQueryKey = ["projectPlace", "fetchPlace", project?.place_id];

  const { data: projectPlace } = useAuthenticatedQuery(
    fetchProjectPlaceQueryKey,
    optsWithAuth => fetchPlace( project?.place_id, {
      fields: "all"
    }, optsWithAuth )
  );

  const { data: projectMembers } = useAuthenticatedQuery(
    ["fetchProjectMembers", id],
    optsWithAuth => fetchProjectMembers( {
      id,
      order_by: "login",
      fields: {
        user: User.LIMITED_FIELDS
      }
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

  const { data: usersObservations } = useAuthenticatedQuery(
    ["searchObservationsByUserInProject", id],
    optsWithAuth => searchObservations(
      {
        project_id: id,
        user_id: currentUser?.id,
        per_page: 0
      },
      optsWithAuth
    ),
    {
      enabled: !!currentUser
    }
  );

  const { data: speciesCounts } = useAuthenticatedQuery(
    ["fetchSpeciesCounts", id],
    ( ) => fetchSpeciesCounts( {
      project_id: id
    } )
  );

  const membershipQueryKey = ["fetchMembership", id];
  const { data: currentMembership } = useAuthenticatedQuery(
    membershipQueryKey,
    optsWithAuth => fetchMembership( {
      id
    }, optsWithAuth ),
    {
      enabled: !!( currentUser )
    }
  );

  const queryClient = useQueryClient( );

  const createJoinProjectMutation = useAuthenticatedMutation(
    ( joinParams, optsWithAuth ) => joinProject( joinParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( membershipQueryKey );
      },
      onError: error => {
        logger.error( "could not join project: ", project.id, error );
      },
      onSettled: ( ) => setLoading( false )
    }
  );

  const createLeaveProjectMutation = useAuthenticatedMutation(
    ( leaveParams, optsWithAuth ) => leaveProject( leaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( membershipQueryKey );
      },
      onError: error => {
        logger.error( "could not leave project: ", project.id, error );
      },
      onSettled: ( ) => setLoading( false )
    }
  );

  const handleJoinProjectPress = ( ) => {
    if ( currentUser ) {
      setLoading( true );
      createJoinProjectMutation.mutate( { id } );
    } else {
      navigation.navigate( "LoginStackNavigator", {
        screen: "Login",
        params: {
          prevScreen: "ProjectDetails",
          projectId: project.id
        }
      } );
    }
  };

  const enrichedProject = useMemo( () => {
    if ( !project ) return null;

    return {
      ...project,
      members_count: projectMembers?.total_results,
      journal_posts_count: projectPosts,
      observations_count: projectStats?.total_results,
      species_count: speciesCounts?.total_results,
      current_user_is_member: currentMembership === 1,
      current_user_observations_count: usersObservations?.total_results,
      place: projectPlace
    };
  }, [
    project,
    projectMembers?.total_results,
    projectPosts,
    projectStats?.total_results,
    speciesCounts?.total_results,
    currentMembership,
    usersObservations?.total_results,
    projectPlace
  ] );

  return (
    <ProjectDetails
      project={enrichedProject}
      joinProject={handleJoinProjectPress}
      leaveProject={( ) => {
        setLoading( true );
        createLeaveProjectMutation.mutate( { id } );
      }}
      loadingProjectMembership={loading}
    />
  );
};

export default ProjectDetailsContainer;
