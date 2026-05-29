import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSpeciesCounts, searchObservations } from "api/observations";
import fetchPlace from "api/places";
import {
  fetchMembership,
  fetchProjectMembers, fetchProjectPosts, fetchProjects, joinProject, leaveProject,
} from "api/projects";
import type { ApiPlace, ApiProject } from "api/types";
import type { TabStackScreenProps } from "navigation/types";
import React, { useMemo, useState } from "react";
import User from "realmModels/User";
import { log } from "sharedHelpers/logger";
import { useAuthenticatedMutation, useAuthenticatedQuery, useCurrentUser } from "sharedHooks";

import ProjectDetails from "./ProjectDetails";

const logger = log.extend( "ProjectDetailsContainer" );

const ProjectDetailsContainer = ( ) => {
  const navigation = useNavigation<TabStackScreenProps<"ProjectDetails">["navigation"]>( );
  const { params } = useRoute<TabStackScreenProps<"ProjectDetails">["route"]>( );
  const { id } = params;
  const currentUser = useCurrentUser( );
  const [loading, setLoading] = useState( false );

  const fetchProjectsQueryKey = ["projectDetails", "fetchProjects", id];

  const { data: project } = useAuthenticatedQuery<ApiProject>(
    fetchProjectsQueryKey,
    optsWithAuth => fetchProjects( id, {
      fields: {
        description: true,
        header_image_url: true,
        icon: true,
        id: true,
        place_id: true,
        project_type: true,
        title: true,
      },
    }, optsWithAuth ),
  );

  const fetchProjectPlaceQueryKey = ["projectPlace", "fetchPlace", project?.place_id];

  const { data: projectPlace } = useAuthenticatedQuery<ApiPlace>(
    fetchProjectPlaceQueryKey,
    optsWithAuth => fetchPlace( project?.place_id, {
      fields: "all",
    }, optsWithAuth ),
  );

  const { data: projectMembers } = useAuthenticatedQuery(
    ["fetchProjectMembers", id],
    optsWithAuth => fetchProjectMembers( {
      id,
      order_by: "login",
      fields: {
        user: User.LIMITED_FIELDS,
      },
    }, optsWithAuth ),
  );

  const { data: projectPosts } = useAuthenticatedQuery(
    ["fetchProjectPosts", id],
    optsWithAuth => fetchProjectPosts( {
      id,
    }, optsWithAuth ),
  );

  const { data: projectStats } = useAuthenticatedQuery(
    ["searchObservations", "projectStats", id],
    ( ) => searchObservations( {
      project_id: id,
      per_page: 0,
    } ),
  );

  const { data: usersObservations } = useAuthenticatedQuery(
    ["searchObservationsByUserInProject", id],
    optsWithAuth => searchObservations(
      {
        project_id: id,
        user_id: currentUser?.id,
        per_page: 0,
      },
      optsWithAuth,
    ),
    {
      enabled: !!currentUser,
    },
  );

  const { data: speciesCounts } = useAuthenticatedQuery(
    ["fetchSpeciesCounts", id],
    ( ) => fetchSpeciesCounts( {
      project_id: id,
      per_page: 0,
    } ),
  );

  const membershipQueryKey = ["fetchMembership", id];
  const { data: currentMembership } = useAuthenticatedQuery(
    membershipQueryKey,
    optsWithAuth => fetchMembership( {
      id,
    }, optsWithAuth ),
    {
      enabled: !!( currentUser ),
    },
  );

  const queryClient = useQueryClient( );

  const { mutate: joinProjectMutate } = useAuthenticatedMutation(
    ( joinParams, optsWithAuth ) => joinProject( joinParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( membershipQueryKey );
      },
      onError: error => {
        // project is not undefined here because we call the mutation in the child
        // which has a !project check before rendering the buttons that call here
        logger.error( "could not join project: ", ( project as ApiProject ).id, error );
      },
      onSettled: ( ) => setLoading( false ),
    },
  );

  const { mutate: leaveProjectMutate } = useAuthenticatedMutation(
    ( leaveParams, optsWithAuth ) => leaveProject( leaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        queryClient.invalidateQueries( membershipQueryKey );
      },
      onError: error => {
        // project is not undefined here because we call the mutation in the child
        // which has a !project check before rendering the buttons that call here
        logger.error( "could not leave project: ", ( project as ApiProject ).id, error );
      },
      onSettled: ( ) => setLoading( false ),
    },
  );

  const handleJoinProjectPress = ( ) => {
    if ( currentUser ) {
      setLoading( true );
      joinProjectMutate( { id } );
    } else {
      navigation.navigate( "LoginStackNavigator", {
        screen: "Login",
        params: {
          prevScreen: "ProjectDetails",
          projectId: project.id,
        },
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
      place: projectPlace,
    };
  }, [
    project,
    projectMembers?.total_results,
    projectPosts,
    projectStats?.total_results,
    speciesCounts?.total_results,
    currentMembership,
    usersObservations?.total_results,
    projectPlace,
  ] );

  return (
    <ProjectDetails
      project={enrichedProject}
      joinProject={handleJoinProjectPress}
      leaveProject={( ) => {
        setLoading( true );
        leaveProjectMutate( { id } );
      }}
      loadingProjectMembership={loading}
    />
  );
};

export default ProjectDetailsContainer;
